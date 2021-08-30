import { Attribute } from './enum/attribute';
import { Trait } from './trait';

export interface AttributeTraits {
    attribute: Attribute;
    rank: number;
    bonusRank: number;
    traits: Array<Trait>;

    recapLabel: string;
    attributeName: string;
    title: string;
    icon: string;
    summary: string;

    template: string;
}