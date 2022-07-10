import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SlormToolsComponent } from './core/components/slorm-tools/slorm-tools.component';


const appRoutes: Routes = [
    {
        path: 'slorm-planner',
        loadChildren: () => import('./modules/slorm-planner/slorm-planner.module').then((m) => m.SlormPlannerModule),
        data: { title: 'Slorm-Planner' }
    },
    {
        path: 'slorm-reaper',
        loadChildren: () => import('./modules/slorm-reaper/slorm-reaper.module').then((m) => m.SlormReaperModule),
        data: { title: 'Slorm-Reaper' }
    },
    {
        path: '',
        component: SlormToolsComponent,
        data: { title: 'Slorm-Tools' }
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: '/'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }