import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { DerpPipe } from "./pipe";

@NgModule({
    declarations: [DerpPipe],
    imports: [IonicModule],
    exports: [DerpPipe]
})
export class PipesModule { }