export interface CharacterConfig {
    percent_missing_mana: number;
    percent_lock_mana: number;
    percent_missing_health: number;
    overall_reputation: number;
    hits_taken_recently: number;
    skill_cast_recently: number;
    ennemies_in_radius: { [key: number]: number};
    elites_in_radius: { [key: number]: number};
    took_elemental_damage_recently: boolean;
    took_damage_before_next_cast: boolean;
    cast_support_before_next_cast: boolean;
    seconds_since_last_crit: number;
    seconds_since_last_dodge: number;
    controlled_minions: number;
    elemental_prowess_stacks: number;
    greed_stacks: number;
    strider_stacks: number;
    merchant_stacks: number;
    totem_dexterity_stacks: number;
    has_aura_air_conditionner: boolean;
    has_aura_neriya_shield: boolean;
    has_aura_elemental_swap: boolean;
    has_aura_risk_of_pain: boolean;
    has_elemental_temper_buff: boolean;
    has_soul_bound_buff: boolean;
    has_burning_shadow_buff: boolean;
    distance_with_target: number;
}