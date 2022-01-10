import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { CharacterAttributes } from '../../../slormancer/model/character';
import { ALL_ATTRIBUTES } from '../../../slormancer/model/content/enum/attribute';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly ALL_ATTRIBUTES = ALL_ATTRIBUTES;

    public attributes: CharacterAttributes | null = null;

    constructor(private buildStorageService: BuildStorageService) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.attributes = layer === null ? null : layer.character.attributes);
    }


}
