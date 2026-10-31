import React from 'react';
import { X, ZoomIn, Move, Hand, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-yellow-500/40 rounded-xl shadow-2xl shadow-black w-full max-w-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-black/90">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
            <Keyboard size={16} className="text-yellow-400" />
            Controles e Navegação 3D / 2D
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-yellow-400 hover:bg-neutral-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-black border border-neutral-850 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-yellow-400 font-mono">
                <RotateLeftIcon /> Rotacionar Grafo (3D)
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Clique com o botão esquerdo e arraste no espaço vazio para girar o grafo em 360°.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-850 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-yellow-400 font-mono">
                <ZoomIn size={14} /> Zoom In / Out
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Gire a roda do mouse (scroll) ou use os botões (+) e (-) no canto da tela.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-850 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-yellow-400 font-mono">
                <Move size={14} /> Pan / Mover Câmera
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Clique com o botão direito e arraste, ou use Shift + botão esquerdo.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-850 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-yellow-400 font-mono">
                <Hand size={14} /> Arrastar Nós
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Clique e arraste qualquer esfera para reposicionar o nó na física tridimensional.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-yellow-500">
              Atalhos de Teclado
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-850">
                <span className="text-zinc-400">Buscar Nó:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-yellow-400 border border-yellow-500/30 font-bold">/</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-850">
                <span className="text-zinc-400">Desmarcar Seleção:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-zinc-300 border border-neutral-800">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-850">
                <span className="text-zinc-400">Centralizar Visão:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-yellow-400 border border-yellow-500/30 font-bold">F</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-850">
                <span className="text-zinc-400">Alternar Painel:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-zinc-300 border border-neutral-800">B</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-neutral-800 bg-black/90 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-bold font-mono bg-yellow-400 hover:bg-yellow-300 text-black shadow-md shadow-yellow-500/25 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

function RotateLeftIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
