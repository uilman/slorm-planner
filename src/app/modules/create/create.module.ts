import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { CreateFirstBuildComponent } from './component/create-first-build/create-first-build.component';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';


@NgModule({
    declarations: [
        CreateComponent,
        CreateFirstBuildComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        CreateRoutingModule,
        OverlayModule,
        FormsModule,
    ],
    providers: [
    ],
})
export class CreateModule { }
