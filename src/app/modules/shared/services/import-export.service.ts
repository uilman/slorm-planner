import { Injectable } from '@angular/core';
import {
    Character,
    HeroClass,
    SlormancerCharacterBuilderService,
    SlormancerSaveParserService,
    SlormancerShortDataService,
    valueOrNull,
} from 'slormancer-api';

import { Build } from '../model/build';
import { Layer } from '../model/layer';
import { SharedData } from '../model/shared-data';
import { JsonConverterService } from './json-converter.service';

@Injectable({ providedIn: 'root' })
export class ImportExportService {

    private readonly VIEW_BUILD_PATH: string;

    constructor(private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerShortDataService: SlormancerShortDataService,
                private jsonConverterService: JsonConverterService) {

        const base = document.getElementsByTagName('base')[0];
        let baseHref = '/';
        if (base !== undefined) {
            const href = base.getAttribute('href');
            if (href !== null) {
                baseHref = href;
            }
        }
        this.VIEW_BUILD_PATH = window.origin + baseHref + 'slorm-planner/view/build/';
    }

    private parseSaveData(content: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(content);
        return this.slormancerCharacterBuilderService.getCharacterFromSave(save, heroClass);
    }

    private parseUrlData(path: string): SharedData {
        let result: SharedData = {
            character: null,
            layer: null,
            planner: null
        }
        let key: string | null = null;


        try {
            const url = new URL(path);
            const fragments = url.pathname.split('/');
            key = valueOrNull(fragments[fragments.length - 1]);
        } catch (e) { }

        if (key !== null) {
           result = this.importFromShortData(key);
        }

        return result;
    }

    private parseJsonData(content: string): SharedData {
        const json = JSON.parse(content);
        return this.jsonConverterService.jsonToSharedData(json);
    }

    public import(content: string, heroClass: HeroClass | null = null): SharedData {
        let data: SharedData = {
            character: null,
            layer: null,
            planner: null
        };

        if (heroClass !== null) {
            try {
                data.character = this.parseSaveData(content, heroClass);
                return data;
            } catch (e) {
                console.error('Error when parsing save file : ', e);
            }
        }

        try {
            data = this.parseJsonData(atob(content));
            return data;
        } catch (e) {}

        try {
            data = this.parseJsonData(content);
            return data;
        } catch (e) { }

        data = this.importFromShortData(content);
        if (data.character === null) {
            data = this.parseUrlData(content);
        }

        console.log('data parsed : ', data);

        return data;
    }

    public exportCharacter(character: Character): string {
        return btoa(JSON.stringify(this.jsonConverterService.characterToJson(character)));
    }

    public exportLayer(layer: Layer): string {
        return btoa(JSON.stringify(this.jsonConverterService.layerToJson(layer)));
    }

    public exportBuild(build: Build): string {
        return btoa(JSON.stringify(this.jsonConverterService.buildToJson(build)));
    }

    public exportCharacterAsLink(character: Character): string {
        const content = this.slormancerShortDataService.characterToShortData(character);
        return this.VIEW_BUILD_PATH + content
    }

    public importFromShortData(key: string): SharedData {
        return {
            character: this.slormancerShortDataService.shortDataToCharacter(key),
            layer: null,
            planner: null
        }
    }
}