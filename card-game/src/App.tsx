// src/App.tsx

import { useState } from 'react';
import type { GameState, GridSlot, Card } from './game/types';
import { createInitialGameState } from './game/setup';
import { flipGridCard } from './game/actions';

// Seating positions (indices into game.players)
const SOUTH_INDEX = 0; // Gage
const WEST_INDEX = 1;  // Player 2
const NORTH_INDEX = 2; // Player 3
const EAST_INDEX = 3;  // Player 4

const INITIAL_STATE: GameState = createInitialGameState([
  'Gage',      // South
  'Arnold',  // West
  'Jack',  // North
  'Tiger',  // East
]);

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  function handleGridClick(playerId: number, row: number, col: number) {
  setGame((prev) => flipGridCard(prev, playerId, row, col));
}

  const southPlayer = game.players[SOUTH_INDEX];
  const westPlayer = game.players[WEST_INDEX];
  const northPlayer = game.players[NORTH_INDEX];
  const eastPlayer = game.players[EAST_INDEX];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Card Game Prototype</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Turn: {game.turn} — Current Player:{' '}
        <strong>{game.players[game.currentPlayerId].name}</strong>
      </p>

            {/* Round table layout using CSS grid for symmetric spacing */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto',
          gridTemplateColumns: 'auto auto auto',
          rowGap: '3rem',      // vertical spacing between rows
          columnGap: '3rem',   // horizontal spacing between columns
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1rem'
        }}
      >
        {/* North player (top center, rotated 180°) */}
        <div style={{ 
          gridRow: 1, gridColumn: 2, textAlign: 'center', marginBottom: '1rem' 
          }}>
          <PlayerPanel
            playerName={northPlayer.name}
            grid={northPlayer.grid}
            rotation={0}
            isCurrent={northPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(northPlayer.id, row, col)
            }
          />
        </div>

        {/* West player (middle left, rotated 90°) */}
        <div style={{ 
          gridRow: 1, gridColumn: 1, textAlign: 'center', transform: 'translateY(90px)' 
          }}>
          <PlayerPanel
            playerName={westPlayer.name}
            grid={westPlayer.grid}
            rotation={0}
            isCurrent={westPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(westPlayer.id, row, col)
            }
          />
        </div>

        {/* Draw and Discard piles to the right of player's hand */}
        <div style={{ gridRow: 2, gridColumn: 3, textAlign: 'center', transform: 'translateY(20px)' }}>
          <CenterPiles
            drawCount={game.drawPile.length}
            discardCount={game.discardPile.length}
            topDiscardCard={game.discardPile[0] ?? null}
          />
        </div>

        {/* East player (middle right, rotated 270°) */}
        <div style={{ gridRow: 1, gridColumn: 3, textAlign: 'center', transform: 'translateY(90px)' }}>
          <PlayerPanel
            playerName={eastPlayer.name}
            grid={eastPlayer.grid}
            rotation={0}
            isCurrent={eastPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(eastPlayer.id, row, col)
            }
          />
        </div>

        {/* South player (bottom center, upright) */}
        <div style={{ gridRow: 2, gridColumn: 2, textAlign: 'center', }}>
          <PlayerPanel
            playerName={southPlayer.name}
            grid={southPlayer.grid}
            rotation={0}
            isCurrent={southPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(southPlayer.id, row, col)
            }
            size = "large"
          />
        </div>
      </div>

    </div>
  );
}

interface PlayerPanelProps {
  playerName: string;
  grid: (GridSlot | null)[][];
  rotation: number; // degrees
  isCurrent: boolean;
  onCellClick?: (row: number, col: number) => void;
  size?: 'normal' | 'large';
}

function PlayerPanel({ playerName, grid, rotation, isCurrent, onCellClick, size }: PlayerPanelProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        opacity: isCurrent ? 1 : 0.75,
      }}
    >
      <div
        style={{
          border: isCurrent ? '2px solid #f6e05e' : '1px solid #4a5568',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          backgroundColor: '#2d3748',
        }}
      >
        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
          {playerName}
          {isCurrent && ' (Your Turn)'}
        </div>
        <GridView grid={grid} onCellClick={onCellClick} size={size}/>
      </div>
    </div>
  );
}

interface GridViewProps {
  grid: (GridSlot | null)[][];
  onCellClick?: (row: number, col: number) => void;
  size?: 'normal' | 'large';
}

function GridView({ grid, onCellClick, size = 'normal' }: GridViewProps) {
  const isLarge = size === 'large';
  const cardWidth = isLarge ? 80 : 45;
  const cardHeight = isLarge ? 120 : 70;
  const cardFontSize = isLarge ? '1.2rem' : '0.9rem';
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${cardWidth}px)`,
        gridTemplateRows: `repeat(3, ${cardHeight}px)`,
        gap: isLarge ? '8px' : '4px',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((slot, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;

          const handleClick = () => 
            onCellClick?.(rowIndex, colIndex);

          if (!slot) {
            return (
              <div
                key={key}
                style={{
                  border: '1px solid #4a5568',
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                }}
              />
            );
          }

          return (
            <div
              key={key}
              onClick={handleClick}
              style={{
                border: '1px solid #4a5568',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2d3748',
                color: 'white',
                fontWeight: 'bold',
                fontSize: cardFontSize,
                cursor: onCellClick ? 'pointer' : 'default',
                userSelect: 'none',
              }}
            >
              {slot.faceUp ? slot.card.rank : 'Golf'}
            </div>
          );
        })
      )}
    </div>
  );
}

interface CenterPilesProps {
  drawCount: number;
  discardCount: number;
  topDiscardCard: Card | null;
}

function CenterPiles({ drawCount, discardCount, topDiscardCard }: CenterPilesProps) {
  const cardWidth = 80;
  const cardHeight = 120;
  const borderRadius = 6;
  const fontSize = '1.1rem';

  // If there's a card in the discard pile, show its rank
  const discardLabel =
    discardCount > 0 && topDiscardCard
      ? topDiscardCard.rank
      : 'DISCARD';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}></div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Draw pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius,
              border: '2px solid #e2e8f0',
              backgroundColor: '#4a5568',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <span style={{ fontSize, fontWeight: 600 }}>DRAW</span>
          </div>
          <div style={{ fontSize }}>
            Cards: <strong>{drawCount}</strong>
          </div>
        </div>

        {/* Discard pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius,
              border: '2px dashed #e2e8f0',
              backgroundColor: discardCount > 0 ? '#742a2a' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              fontSize,
              fontWeight: 700,
              color: discardCount > 0 ? 'white' : '#e2e8f0',
              userSelect: 'none',
            }}
          >
            {/* This now shows the card's rank */}
            {discardLabel}
          </div>
          <div style={{ fontSize }}>
            Cards: <strong>{discardCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
