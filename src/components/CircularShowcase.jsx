import React, { useState, useRef, useEffect } from 'react';
import '../index.css';
import Header from './Header';
import './HalfPageBackground.css';
import './CarruselTexto.css';

const cards = [
  { id: 1, title: 'Grupos Reducidos', img: '/img/021.jpg' },
  { id: 2, title: 'Piscina Termal', img: '/img/021.jpg' },
  { id: 3, title: 'Bosque Privado', img: '/img/021.jpg' },
  { id: 4, title: 'Experiencia Exclusiva', img: '/img/021.jpg' },
  { id: 5, title: 'Prioridad: Seguridad', img: '/img/021.jpg' },
  { id: 6, title: 'Naturaleza: Viva', img: '/img/021.jpg' },
];

const getDimensions = () => {
  const isMobile = window.innerWidth < 768;
  return {
    isMobile,
    radius: isMobile ? 200 : 410,
    baseCardWidth: isMobile ? 110 : 185,
    baseCardHeight: isMobile ? 110 : 145,
    baseImageWidth: isMobile ? 90 : 170,
    baseImageHeight: isMobile ? 70 : 100,
    llantaSize: isMobile ? 250 : 550,
    borderSize: isMobile ? 320 : 600,
  };
};

export default function LlantaConCarrusel() {
  const [dimensions, setDimensions] = useState(getDimensions());

  // Usamos un ref para la rotación real, y estado para animar CSS
  const rotationRef = useRef(270);
  const [rotation, setRotation] = useState(270);

  const [scaleAnim, setScaleAnim] = useState(Array(cards.length).fill(1));
  const [draggedHighlighted, setDraggedHighlighted] = useState(-1);

  const total = cards.length;
  const stepAngle = 360 / total;
  const sens = dimensions.isMobile ? 0.18 : 0.08;
  const snapTime = 400;

  const [textCard, setTextCard] = useState(() => {
    for (let i = 0; i < total; i++) {
      const ang = (stepAngle * i + 270) % 360;
      const n = ang < 0 ? ang + 360 : ang;
      if (Math.round(n) === 270) return i;
    }
    return -1;
  });

  const dragging = useRef(false);
  const lastX = useRef(0);
  const snapId = useRef(null);
  const snapStartTs = useRef(null);
  const startRot = useRef(0);
  const targetRot = useRef(0);
  const snapping = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onResize = () => setDimensions(getDimensions());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Card que está "exacto" en norte (270º), redondeando
  const highlighted = (() => {
    for (let i = 0; i < total; i++) {
      const ang = (stepAngle * i + rotationRef.current) % 360;
      const n = ang < 0 ? ang + 360 : ang;
      if (Math.round(n) === 270) return i;
    }
    return -1;
  })();

  // Zoom se mantiene en card inicial durante drag, y después en highlighted
  const zoomCard = dragging.current ? draggedHighlighted : highlighted;

  const begin = x => {
    if (snapping.current) cancelAnimationFrame(snapId.current);
    dragging.current = true;
    lastX.current = x;
    setDraggedHighlighted(highlighted);
  };

  const move = x => {
    if (!dragging.current || snapping.current) return;
    const dx = x - lastX.current;
    rotationRef.current += dx * sens;
    lastX.current = x;

    if (!ticking.current) {
      ticking.current = true;
      requestAnimationFrame(() => {
        setRotation(rotationRef.current);
        ticking.current = false;
      });
    }
  };

  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    smoothSnap(rotationRef.current);
  };

  const onMouseDown = e => begin(e.clientX);
  const onMouseMove = e => move(e.clientX);
  const onMouseUp = end;
  const onTouchStart = e => begin(e.touches[0].clientX);
  const onTouchMove = e => move(e.touches[0].clientX);
  const onTouchEnd = end;

  const snapRot = a => {
    let n = a % 360;
    if (n < 0) n += 360;
    const idx = Math.round((270 - n) / stepAngle);
    const turns = Math.floor(a / 360);
    return 270 - idx * stepAngle + turns * 360;
  };

  const smoothSnap = a => {
    snapping.current = true;
    snapStartTs.current = null;
    startRot.current = a;
    targetRot.current = snapRot(a);

    const step = ts => {
      if (!snapStartTs.current) snapStartTs.current = ts;
      const t = Math.min((ts - snapStartTs.current) / snapTime, 1);
      const ease = 1 - (1 - t) * (1 - t);
      const val = startRot.current + (targetRot.current - startRot.current) * ease;
      rotationRef.current = val;
      setRotation(val);
      if (t < 1) {
        snapId.current = requestAnimationFrame(step);
      } else {
        snapping.current = false;
        // Actualizar texto al terminar snap con la card correcta
        const newHighlighted = (() => {
          for (let i = 0; i < total; i++) {
            const ang = (stepAngle * i + targetRot.current) % 360;
            const n = ang < 0 ? ang + 360 : ang;
            if (Math.round(n) === 270) return i;
          }
          return -1;
        })();
        setTextCard(newHighlighted);
      }
    };
    snapId.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const target = cards.map((_, i) =>
      i === zoomCard ? (dimensions.isMobile ? 1.5 : 2.2) : 1
    );
    const start = scaleAnim;
    const dur = 300;
    let t0 = null;
    const step = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const ease = 1 - (1 - p) * (1 - p);
      setScaleAnim(start.map((s, i) => s + (target[i] - s) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [zoomCard, dimensions.isMobile]);

  const R = dimensions.borderSize / 2;

  return (
    <>
      <div className="half-page-background" />
      <div className="galeria-contenedor">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-start',
            transform: 'translateY(50px)', // Mismo desplazamiento que la imagen
          }}
        >
          <div className="galeria-texto">Galería de Aventuras</div>
          <button className="galeria-btn">
            Ver galería <span className="arrow">➜</span>
          </button>
        </div>

        <img src="/img/021.jpg" alt="Galería" className="galeria-imagen" />
      </div>

      <Header />

      <div
        className="carrusel-wrapper"
        style={{
          position: 'relative',
          width: dimensions.borderSize,
          height: dimensions.borderSize,
          margin: '0 auto',
          userSelect: 'none',
          borderRadius: '50%',
          overflow: 'visible',
          marginTop: dimensions.isMobile ? 400 : 420,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Texto fijo en parte superior derecha */}
        <div
          className={`texto-info-container ${dimensions.isMobile ? 'mobile' : 'desktop'}`}
        >
          <div className="texto-info-titulo">
            {dimensions.isMobile ? (
              <>
                Recorrido dentro
                <br />
                de nuestro bosque
                <br />
                {textCard >= 0 ? cards[textCard]?.title.replace(/ /g, '\u00AD ') : ''}.
              </>
            ) : (
              <>
                Recorrido dentro de
                <br />
                nuestro bosque
                <br />
                {textCard >= 0 ? cards[textCard]?.title : ''}.
              </>
            )}
          </div>

          <div
            className="texto-info-subtitulo"
            style={{ fontSize: dimensions.isMobile ? 11 : 18 }}
          >
            <div className="texto-info-subtitulo titulo-superquads-pequeno">
              SUPER QUADS
            </div>
          </div>
        </div>

        {/* círculo rojo + llanta */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid red',
            transform: `rotate(${rotation}deg)`,
            transition: dragging.current || snapping.current ? 'none' : 'transform 0.3s',
            pointerEvents: 'none',
          }}
        >
          <img
            src="/img/Llanta.png"
            alt="Llanta"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: dimensions.llantaSize,
              height: dimensions.llantaSize,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              zIndex: 2,
            }}
            draggable={false}
          />

          {cards.map((c, i) => {
            const ang = stepAngle * i;
            const rad = (ang * Math.PI) / 180;
            const x = R + R * Math.cos(rad);
            const y = R + R * Math.sin(rad);
            return (
              <div
                key={c.id}
                style={{
                  position: 'absolute',
                  top: y - 5,
                  left: x - 5,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'red',
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </div>

        {/* tarjetas */}
        {cards.map((c, i) => {
          const ang = stepAngle * i + rotation;
          const rad = (ang * Math.PI) / 180;
          const x = R + dimensions.radius * Math.cos(rad) - dimensions.baseCardWidth / 2;
          const y = R + dimensions.radius * Math.sin(rad) - dimensions.baseCardHeight / 2;
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                top: y,
                left: x,
                width: dimensions.baseCardWidth,
                height: dimensions.baseCardHeight,
                background: '#fff',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                userSelect: 'none',
                transform: `scale(${scaleAnim[i]}) rotate(${ang + 90}deg)`,
                zIndex: scaleAnim[i] > 1 ? 20 : 1,
                overflow: 'hidden',
              }}
              draggable={false}
            >
              <img
                src={c.img}
                alt={c.title}
                style={{
                  width: dimensions.baseImageWidth,
                  height: dimensions.baseImageHeight,
                  objectFit: 'cover',
                  marginBottom: 6,
                }}
                draggable={false}
              />
              <span style={{ fontWeight: 600, fontSize: dimensions.isMobile ? 12 : 14 }}>
                {c.title}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
