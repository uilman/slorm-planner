import { Buff } from './buff';
import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { Mechanic } from './mechanic';
import { SkillClassMechanic } from './skill-class-mechanic';
import { SkillType } from './skill-type';

export interface SkillUpgrade {
    id: number;
    skillId: number;
    masteryRequired: number;
    line: number;
    type: SkillType.Passive | SkillType.Upgrade;
    upgradeLevel: number | null;
    rank: number;
    maxRank: number;
    baseRank: number;
    name: string;
    icon: string;
    description: string;
    initialCost: number;
    perLevelCost: number;
    baseCost: number;
    cost: number;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    genres: Array<SkillGenre>;
    damageTypes: Array<string>;

    nextRankDescription: Array<string>;
    maxRankDescription: Array<string>;
    nextRankTemplate: Array<string>;

    relatedClassMechanics: Array<SkillClassMechanic>;
    relatedMechanics: Array<Mechanic>;
    relatedBuffs: Array<Buff>;

    masteryLabel: string | null;
    rankLabel: string | null;
    genresLabel: string | null;
    costLabel: string | null;

    template: string;
    values: Array<AbstractEffectValue>;
}