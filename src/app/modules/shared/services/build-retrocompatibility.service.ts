import { Injectable } from '@angular/core';

import { GAME_VERSION } from '../../slormancer/constants/common';
import { DEFAULT_CONFIG } from '../../slormancer/constants/content/data/default-configs';
import { compareVersions } from '../../slormancer/util/utils';
import { Build } from '../model/build';

@Injectable({ providedIn: 'root' })
export class BuildRetrocompatibilityService {

    private readonly CHANGES: Array<{ version: string, update: (build: Build) => void }> = [
        {
            version: '0.0.2',
            update: build => {
                build.configuration['frostbolt_shot_recently'] = 0;
                build.configuration['has_elemental_prowess_buff'] = false;
                build.configuration['has_splash_splash_buff'] = false;
                build.configuration['has_booster_max_buff'] = false;
                build.version = '0.0.2';
            }
        },
        {
            version: '0.0.4',
            update: build => {
                build.configuration['use_enemy_state'] = false;
                build.version = '0.0.4';
            }
        },
        {
            version: '0.0.8',
            update: build => {
                build.version = '0.0.8';

                for (const layer of build.layers) {
                    layer.character.originalVersion = layer.character.version;
                    layer.character.version = GAME_VERSION;
                }

                build.configuration['has_electrify_buff'] = false;
                build.configuration['elemental_spirit_stacks'] = 0;
                build.configuration['is_channeling_focus'] = false;
            }
        },
        {
            version: '0.0.9',
            update: build => {
                build.version = '0.0.9';

                for (const layer of build.layers) {
                    layer.character.version = GAME_VERSION;
                }
            }
        },
        {
            version: '0.0.10',
            update: build => {
                build.version = '0.0.10';
            }
        },
        {
            version: '0.0.11',
            update: build => {
                build.version = '0.0.11';
                build.name = 'New build'
            }
        },
    ];

    constructor() { }

    public updateToLatestVersion(build: Build) {
        
        if (build.version === undefined) {
            build.version = '0.0.1';
            build.configuration = DEFAULT_CONFIG;
        }

        for (let change of this.CHANGES) {
            if (compareVersions(change.version, build.version) > 0) {
                change.update(build);
            }
        }
    }

}