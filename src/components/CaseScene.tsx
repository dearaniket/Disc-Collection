import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FORMATS, MAX_H } from '../lib/formats';
import type { CaseItem } from '../lib/types';

const U = 0.01; // scene units per millimetre
const LID_T = 2 * U;

export interface Pose {
  face: 0 | 1; // 0 front, 1 back
  open: boolean;
  disc: boolean;
}

interface Props {
  item: CaseItem;
  urls: { front?: string; back?: string; inside?: string };
  pose: Pose;
  onFace: (face: 0 | 1) => void;
  onReady: () => void;
  reduced: boolean;
}

/** Spring step: critically-near damped, frame-rate independent. */
function spring(x: number, v: number, target: number, k: number, c: number, dt: number) {
  const a = (target - x) * k - v * c;
  const nv = v + a * dt;
  return [x + nv * dt, nv] as const;
}

function loadTex(url: string) {
  return new Promise<THREE.Texture>((res, rej) =>
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        res(t);
      },
      undefined,
      rej,
    ),
  );
}

function spineTexture(item: CaseItem) {
  const f = FORMATS[item.format];
  const c = document.createElement('canvas');
  c.width = f.h * 6;
  c.height = f.d * 6;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = f.plastic;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = item.tint;
  ctx.fillRect(c.width * 0.14, 0, c.width * 0.86, c.height);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(c.width * 0.14, 0, c.width * 0.86, c.height);
  ctx.fillStyle = f.ink;
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(c.height * 0.5)}px Antonio, sans-serif`;
  ctx.fillText(f.label.toUpperCase(), c.height * 0.4, c.height / 2 + 2);
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(c.height * 0.56)}px Antonio, sans-serif`;
  ctx.fillText(item.title.toUpperCase(), c.width * 0.18, c.height / 2 + 2, c.width * 0.62);
  ctx.textAlign = 'right';
  ctx.font = `600 ${Math.round(c.height * 0.4)}px Antonio, sans-serif`;
  ctx.fillText(String(item.no).padStart(4, '0'), c.width - c.height * 0.4, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelTexture(front: THREE.Texture | undefined, plastic: string) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.clip();
  // The cylinder cap maps the canvas a quarter turn off; pre-rotate so the label reads upright.
  ctx.translate(S / 2, S / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-S / 2, -S / 2);
  const img = front?.image as CanvasImageSource | undefined;
  if (img && 'width' in img) {
    const iw = (img as HTMLImageElement).width;
    const ih = (img as HTMLImageElement).height;
    const s = Math.min(iw, ih) * 0.9;
    ctx.drawImage(img, (iw - s) / 2, ih * 0.12, s, s, 0, 0, S, S);
  } else {
    ctx.fillStyle = plastic;
    ctx.fillRect(0, 0, S, S);
  }
  ctx.restore();
  // Clear hub ring and centre hole.
  ctx.fillStyle = 'rgba(220,224,230,1)';
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.062, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function CaseModel({ item, urls, pose, onFace, onReady, reduced, drag }: Props & { drag: React.MutableRefObject<DragState> }) {
  const f = FORMATS[item.format];
  const w = f.w * U;
  const h = f.h * U;
  const d = f.d * U;
  const isCart = item.format === 'switch';
  const [tex, setTex] = useState<{ front?: THREE.Texture; back?: THREE.Texture; inside?: THREE.Texture }>();
  const { viewport } = useThree();

  useEffect(() => {
    let alive = true;
    Promise.all([
      urls.front ? loadTex(urls.front) : undefined,
      urls.back ? loadTex(urls.back) : undefined,
      urls.inside ? loadTex(urls.inside) : undefined,
    ]).then(([front, back, inside]) => {
      if (!alive) return;
      setTex({ front, back, inside });
    });
    return () => {
      alive = false;
    };
  }, [urls.front, urls.back, urls.inside]);

  useEffect(() => {
    if (tex) requestAnimationFrame(onReady);
  }, [tex, onReady]);

  const mats = useMemo(() => {
    const plastic = new THREE.MeshPhysicalMaterial({ color: f.plastic, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.18 });
    const trayInside = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(f.plastic).multiplyScalar(0.7), roughness: 0.55, clearcoat: 0.6 });
    const sleeve = (map?: THREE.Texture) =>
      new THREE.MeshPhysicalMaterial({ map: map ?? null, color: map ? '#ffffff' : f.plastic, roughness: 0.55, clearcoat: 0.9, clearcoatRoughness: 0.08 });
    const spine = new THREE.MeshPhysicalMaterial({ map: spineTexture(item), roughness: 0.5, clearcoat: 0.9, clearcoatRoughness: 0.08 });
    const label = new THREE.MeshPhysicalMaterial({ map: labelTexture(tex?.front, f.plastic), transparent: true, roughness: 0.45, metalness: 0.1 });
    const data = new THREE.MeshPhysicalMaterial({ color: '#d9dde3', metalness: 1, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 900] });
    const edge = new THREE.MeshPhysicalMaterial({ color: '#c8ccd2', metalness: 0.9, roughness: 0.25 });
    return {
      plastic,
      lid: [plastic, plastic, plastic, plastic, sleeve(tex?.front), sleeve(tex?.inside)],
      tray: [plastic, plastic, plastic, plastic, trayInside, sleeve(tex?.back)],
      spine,
      disc: [edge, label, data],
      cart: new THREE.MeshPhysicalMaterial({ color: '#2b2b2e', roughness: 0.4 }),
    };
  }, [tex, item, f.plastic]);

  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Mesh>(null);
  const s = useRef({ rot: 0, rotV: 0, lid: 0, lidV: 0, open: 0, openV: 0, disc: 0, discV: 0, spinV: 0 });

  // Rail flips: move to the nearest angle with the requested parity.
  useEffect(() => {
    const st = drag.current;
    const k = Math.round(st.target / Math.PI);
    if (((k % 2) + 2) % 2 !== pose.face) st.target = (k + 1) * Math.PI;
  }, [pose.face, drag]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const st = s.current;
    const dr = drag.current;
    const k = reduced ? 400 : 140;
    const c = reduced ? 40 : 19;

    if (dr.active) {
      st.rot = dr.rot;
      st.rotV = dr.vel;
    } else {
      [st.rot, st.rotV] = spring(st.rot, st.rotV, dr.target, k, c, dt);
      dr.rot = st.rot;
      const face = (((Math.round(dr.target / Math.PI) % 2) + 2) % 2) as 0 | 1;
      if (face !== dr.lastFace) {
        dr.lastFace = face;
        onFace(face);
      }
    }

    const openT = pose.open || pose.disc ? 1 : 0;
    [st.open, st.openV] = spring(st.open, st.openV, openT, reduced ? 400 : 90, reduced ? 40 : 17, dt);
    const discT = pose.disc ? 1 : 0;
    [st.disc, st.discV] = spring(st.disc, st.discV, discT, reduced ? 400 : 70, reduced ? 40 : 14, dt);

    // Spread fit: when open, the lid swings out left, so slide right and shrink to fit the viewport.
    const spread = 2 * w + 0.1;
    // The rail owns the right ~20% of a phone screen; keep the spread clear of it.
    const narrow = viewport.width < viewport.height;
    const fit = Math.min(1, (viewport.width * (narrow ? 0.78 : 0.9)) / spread);
    const sc = 1 + (fit - 1) * st.open;
    if (root.current) {
      root.current.rotation.y = st.rot + THREE.MathUtils.lerp(0.34, 0.08, st.open);
      root.current.rotation.x = THREE.MathUtils.lerp(0.06, 0.12, st.open);
      root.current.position.x = ((w / 2) * sc - (narrow ? viewport.width * 0.09 : 0)) * st.open;
      root.current.scale.setScalar(sc);
    }
    if (lid.current) lid.current.rotation.y = -0.93 * Math.PI * Math.min(1, Math.max(0, st.open));
    if (disc.current) {
      const e = st.disc;
      disc.current.position.set(0, (isCart ? 0.25 * h : 0) + e * h * 0.42,d / 2 - LID_T + 0.008 + e * 0.55);
      disc.current.rotation.x = -e * 0.35;
    }
    if (spin.current && !reduced) {
      st.spinV += ((pose.disc ? 2.2 : 0) - st.spinV) * Math.min(1, dt * 2);
      spin.current.rotation.y += st.spinV * dt;
    }
  });

  if (!tex) return null;

  const discY = isCart ? 0.25 * h : 0;
  return (
    <group position={[0, -(MAX_H * U - h) / 2, 0]}>
    <group ref={root}>
      {/* Tray (back half): back cover outside, plastic tub inside */}
      <mesh position={[0, 0, -LID_T / 2]} material={mats.tray}>
        <boxGeometry args={[w, h, d - LID_T]} />
      </mesh>
      {/* Spine */}
      <mesh position={[-w / 2 - 0.0006, 0, 0]} rotation={[0, -Math.PI / 2, Math.PI / 2]} material={mats.spine}>
        <planeGeometry args={[h, d]} />
      </mesh>
      {/* Hub */}
      {!isCart && (
        <mesh position={[0, 0, d / 2 - LID_T + 0.004]} rotation={[Math.PI / 2, 0, 0]} material={mats.plastic}>
          <cylinderGeometry args={[0.075, 0.08, 0.008, 32]} />
        </mesh>
      )}
      {/* Disc or cartridge */}
      <group ref={disc} position={[0, discY, d / 2 - LID_T + 0.008]}>
        {isCart ? (
          <mesh ref={spin} material={mats.cart}>
            <boxGeometry args={[21 * U * 2, 31 * U * 2, 3.3 * U]} />
          </mesh>
        ) : (
          <mesh ref={spin} rotation={[Math.PI / 2, 0, 0]} material={mats.disc}>
            <cylinderGeometry args={[0.6, 0.6, 0.012, 96]} />
          </mesh>
        )}
      </group>
      {/* Lid (front cover), hinged at the spine */}
      <group ref={lid} position={[-w / 2, 0, d / 2 - LID_T / 2]}>
        <mesh position={[w / 2, 0, 0]} material={mats.lid}>
          <boxGeometry args={[w, h, LID_T]} />
        </mesh>
      </group>
    </group>
    </group>
  );
}

export interface DragState {
  active: boolean;
  startX: number;
  startRot: number;
  rot: number;
  vel: number;
  lastX: number;
  lastT: number;
  target: number;
  lastFace: 0 | 1;
}

export function CaseScene(props: Props) {
  const drag = useRef<DragState>({ active: false, startX: 0, startRot: 0, rot: 0, vel: 0, lastX: 0, lastT: 0, target: 0, lastFace: 0 });
  const axis = useRef<'x' | 'y' | null>(null);
  const startY = useRef(0);
  // Camera framed so the tallest case fills ~58% of the canvas height; every format keeps true scale.
  const fov = 28;
  const dist = (MAX_H * U) / 0.58 / 2 / Math.tan(((fov / 2) * Math.PI) / 180);

  const onDown = (e: React.PointerEvent) => {
    const st = drag.current;
    st.startX = st.lastX = e.clientX;
    startY.current = e.clientY;
    st.startRot = st.rot;
    st.lastT = performance.now();
    st.vel = 0;
    axis.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const st = drag.current;
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - startY.current;
    if (!axis.current) {
      if (Math.hypot(dx, dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis.current === 'y') {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        return;
      }
      st.active = true;
    }
    if (axis.current !== 'x') return;
    const now = performance.now();
    const ddt = Math.max(1, now - st.lastT) / 1000;
    const nextRot = st.startRot + dx * 0.011;
    st.vel = (nextRot - st.rot) / ddt;
    st.rot = nextRot;
    st.lastX = e.clientX;
    st.lastT = now;
  };
  const onUp = () => {
    const st = drag.current;
    if (!st.active) return;
    st.active = false;
    // Project the throw, then rest on the nearest face.
    const projected = st.rot + st.vel * 0.18;
    st.target = Math.round(projected / Math.PI) * Math.PI;
  };

  return (
    <div
      className="scene"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-hidden="true"
    >
      <Canvas dpr={[1, 2]} camera={{ fov, position: [0, 0.1, dist] }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, 1, -3]} intensity={0.5} color="#c7b9a6" />
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
          <Lightformer intensity={0.8} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[3, 5, 1]} color="#c7b9a6" />
        </Environment>
        <CaseModel {...props} drag={drag} />
        <ContactShadows position={[0, -(MAX_H * U) / 2 - 0.08, 0]} opacity={0.55} blur={2.6} far={1.4} scale={6} resolution={512} />
      </Canvas>
    </div>
  );
}
