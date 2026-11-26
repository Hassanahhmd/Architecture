'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { Design, Finish, Module } from '@/lib/model';

const colors: Record<Finish, string> = {
  oak: '#b88a5a', walnut: '#65452f', white: '#e8e5df', greige: '#aaa094', black: '#343434'
};

function Cabinet({ m }: { m: Module }) {
  const color = colors[m.finish];
  return <group position={[m.x + m.width/2, m.y + m.height/2, m.depth/2]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[Math.max(.02,m.width-.018),Math.max(.02,m.height-.018),m.depth]} />
      <meshStandardMaterial color={color} roughness={.48} />
    </mesh>
    <mesh position={[0,0,m.depth/2+.012]}>
      <boxGeometry args={[Math.max(.02,m.width*.88),Math.max(.02,m.height*.88),.018]} />
      <meshStandardMaterial color={m.finish==='white'?'#f8f7f4':color} roughness={.35} />
    </mesh>
    <mesh position={[m.width*.28,0,m.depth/2+.03]}>
      <boxGeometry args={[.018,.12,.025]} />
      <meshStandardMaterial color="#b9b4aa" metalness={.7} roughness={.25} />
    </mesh>
  </group>;
}

export default function Scene({ design }: { design: Design }) {
  const maxX = Math.max(3,...design.modules.map(m=>m.x+m.width));
  return <div className="scene">
    <Canvas shadows camera={{position:[maxX+1.8,4.4,6.8],fov:42}}>
      <color attach="background" args={['#e9e7e2']} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4,7,5]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[maxX/2,-.015,1.7]} receiveShadow>
        <planeGeometry args={[maxX+1.5,4.5]} /><meshStandardMaterial color="#d7d2ca" />
      </mesh>
      <mesh position={[maxX/2,1.45,-.06]}>
        <boxGeometry args={[maxX+1,2.9,.08]} /><meshStandardMaterial color="#eeeae3" />
      </mesh>
      {design.modules.map(m=><Cabinet key={m.id} m={m} />)}
      <mesh position={[maxX/2,.91,.32]}>
        <boxGeometry args={[maxX,.055,.72]} /><meshStandardMaterial color="#e5dfd5" roughness={.22} />
      </mesh>
      <ContactShadows position={[maxX/2,.001,1.6]} opacity={.25} scale={8} blur={2} />
      <Environment preset="apartment" />
      <OrbitControls makeDefault target={[maxX/2,.9,1.2]} maxPolarAngle={Math.PI/2.03} />
    </Canvas>
  </div>;
}
