import React from 'react';
import { GameId } from '../../types';
import { LuckyJackpotGame } from './LuckyJackpotGame';
import { MegaSpinGame } from './MegaSpinGame';
import { RoyalWheelGame } from './RoyalWheelGame';
import { DiamondSlotsGame } from './DiamondSlotsGame';
import { Lucky777Game } from './Lucky777Game';
import { GoldRushGame } from './GoldRushGame';
import { TreasureHuntGame } from './TreasureHuntGame';
import { ColorWheelGame } from './ColorWheelGame';
import { FruitSlotsGame } from './FruitSlotsGame';
import { LuckyDiceGame } from './LuckyDiceGame';
import { MysteryBoxGame } from './MysteryBoxGame';
import { SuperSpinnerGame } from './SuperSpinnerGame';
import { DragonJackpotGame } from './DragonJackpotGame';
import { StarSpinGame } from './StarSpinGame';
import { UltimateJackpotGame } from './UltimateJackpotGame';

export const GameRenderer: React.FC<{ gameId: GameId }> = ({ gameId }) => {
  switch (gameId) {
    case 'lucky-jackpot':
      return <LuckyJackpotGame />;
    case 'mega-spin':
      return <MegaSpinGame />;
    case 'royal-wheel':
      return <RoyalWheelGame />;
    case 'diamond-slots':
      return <DiamondSlotsGame />;
    case 'lucky-777':
      return <Lucky777Game />;
    case 'gold-rush':
      return <GoldRushGame />;
    case 'treasure-hunt':
      return <TreasureHuntGame />;
    case 'color-wheel':
      return <ColorWheelGame />;
    case 'fruit-slots':
      return <FruitSlotsGame />;
    case 'lucky-dice':
      return <LuckyDiceGame />;
    case 'mystery-box':
      return <MysteryBoxGame />;
    case 'super-spinner':
      return <SuperSpinnerGame />;
    case 'dragon-jackpot':
      return <DragonJackpotGame />;
    case 'star-spin':
      return <StarSpinGame />;
    case 'ultimate-jackpot':
      return <UltimateJackpotGame />;
    default:
      return null;
  }
};
