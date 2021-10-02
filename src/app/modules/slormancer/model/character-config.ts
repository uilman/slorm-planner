export interface CharacterConfig {
    serenity: number;
    last_cast_tormented: boolean;
    last_cast_delighted: boolean;
    percent_missing_mana: number;
    percent_lock_mana: number;
    percent_missing_health: number;
    enemy_percent_missing_health: number;
    enemy_is_poisoned: boolean;
    overall_reputation: number;
    totems_under_control: number;
    traps_nearby: number;
    slormocide_60: number;
    goldbane_5: number;
    hits_taken_recently: number;
    skill_cast_recently: number;
    frostbold_shot_recently: number;
    rebounds_before_hit: number;
    pierces_before_hit: number;
    enemies_in_aoe: number;
    target_is_isolated: boolean;
    target_is_tracked: boolean;
    target_has_negative_effect: boolean;
    is_first_hit: boolean;
    is_last_volley: boolean;
    ennemies_in_radius: { [key: number]: number};
    negative_effects_on_ennemies_in_radius: { [key: number]: number};
    elites_in_radius: { [key: number]: number};
    poison_enemies: number;
    trap_triggered_recently: boolean;
    took_elemental_damage_recently: boolean;
    took_damage_before_next_cast: boolean;
    damage_stored: number;
    cast_support_before_next_cast: boolean;
    seconds_since_last_crit: number;
    seconds_since_last_dodge: number;
    controlled_minions: number;
    elemental_prowess_stacks: number;
    greed_stacks: number;
    strider_stacks: number;
    merchant_stacks: number;
    totem_dexterity_stacks: number;
    nimble_champion_stacks: number;
    ancestral_legacy_stacks: number;
    conquest_stacks: number;
    stability_stacks: number;
    enlightenment_stacks: number;
    delightful_rain_stack: number;
    has_aura_air_conditionner: boolean;
    has_aura_neriya_shield: boolean;
    has_aura_elemental_swap: boolean;
    has_aura_risk_of_pain: boolean;
    has_aura_inextricable_torment: boolean;
    has_elemental_temper_buff: boolean;
    has_soul_bound_buff: boolean;
    has_burning_shadow_buff: boolean;
    has_adam_blessing_buff: boolean;
    has_gold_armor_buff: boolean;
    has_manabender_buff: boolean;
    has_nimble_buff: boolean;
    has_elemental_fervor_buff: boolean;
    has_ancestral_fervor_buff: boolean;
    has_ancient_recognition_buff: boolean;
    has_assassin_haste_buff: boolean;
    has_smoke_screen_buff: boolean;
    has_ancestral_stab_slash_buff: boolean;
    distance_with_target: number;
    all_characters_level: number;
    victims_reaper_104: number;
    idle: boolean;
    overdrive_bounces_left: number;
    overdrive_last_bounce: boolean;
    hero_close_to_turret_syndrome: boolean;
    turret_syndrome_on_cooldown: boolean;
}