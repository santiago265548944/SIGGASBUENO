import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  AfterContentInit
} from '@angular/core';
import { jqxDropDownButtonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdropdownbutton';
import { MemoryService } from '../cache/memory.service';
import { jqxNumberInputComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxnumberinput';
import { jqxColorPickerComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxcolorpicker';

@Component({
  selector: 'app-draw-color',
  templateUrl: './draw-color.component.html',
  styleUrls: ['./draw-color.component.css']
})
export class DrawColorComponent
  implements OnInit, AfterViewInit, AfterContentInit {
  @ViewChild('selectPointStyle') selectPointStyle: ElementRef;
  selectPointStyleOption: any;
  styleOptionsData: Array<any>;
  closeFunction: Function;

  @ViewChild('selectFontFamily') selectFontFamily: ElementRef;
  selectFontFamilyOption: any;
  selectFontFamilyData: Array<any>;
  textMapDraw: string;

  @ViewChild('callOutBackground') callOutBackground: jqxDropDownButtonComponent;
  @ViewChild('callOutBorderColor')
  callOutBorderColor: jqxDropDownButtonComponent;
  @ViewChild('callOutFontColor') callOutFontColor: jqxDropDownButtonComponent;
  @ViewChild('callOutBorderRadius')
  callOutBorderRadius: jqxNumberInputComponent;
  @ViewChild('callOutFontSize') callOutFontSize: jqxNumberInputComponent;

  @ViewChild('pointColor') pointColor: jqxDropDownButtonComponent;
  @ViewChild('tempLineColor') tempLineColor: jqxDropDownButtonComponent;
  @ViewChild('tempFillColor') tempFillColor: jqxDropDownButtonComponent;
  @ViewChild('lineColor') lineColor: jqxDropDownButtonComponent;
  @ViewChild('fillColor') fillColor: jqxDropDownButtonComponent;

  @ViewChild('pointSize') pointSize: jqxNumberInputComponent;
  @ViewChild('pointStyle') pointStyle: jqxNumberInputComponent;
  @ViewChild('tempLineWidth') tempLineWidth: jqxNumberInputComponent;
  @ViewChild('tempBorderThickness')
  tempBorderThickness: jqxNumberInputComponent;
  @ViewChild('borderThickness') borderThickness: jqxNumberInputComponent;
  @ViewChild('lineWidth') lineWidth: jqxNumberInputComponent;

  @ViewChild('fontColor') fontColor: jqxDropDownButtonComponent;
  @ViewChild('fontSize') fontSize: jqxNumberInputComponent;

  @ViewChild('callOutBackgroundPic')
  callOutBackgroundPic: jqxColorPickerComponent;
  @ViewChild('callOutBorderColorPic')
  callOutBorderColorPic: jqxColorPickerComponent;
  @ViewChild('callOutFontColorPic')
  callOutFontColorPic: jqxColorPickerComponent;
  @ViewChild('pointColorPic') pointColorPic: jqxColorPickerComponent;
  @ViewChild('tempLineColorPic') tempLineColorPic: jqxColorPickerComponent;
  @ViewChild('tempFillColorPic') tempFillColorPic: jqxColorPickerComponent;
  @ViewChild('lineColorPic') lineColorPic: jqxColorPickerComponent;
  @ViewChild('fillColorPic') fillColorPic: jqxColorPickerComponent;
  @ViewChild('fontColorPic') fontColorPic: jqxColorPickerComponent;

  constructor(
    private memoryService: MemoryService
  ) {
    this.styleOptionsData = new Array<any>();
    this.selectFontFamilyData = new Array<any>();
  }

  ngOnInit() {
    this.selectFontFamilyOption = this.memoryService.getItem('FontFamily');
    this.selectPointStyleOption = this.memoryService.getItem('PointStyle');

    this.styleOptionsData.push({ text: 'Circle', value: '0' });
    this.styleOptionsData.push({ text: 'Square', value: '1' });
    this.styleOptionsData.push({ text: 'Cross', value: '2' });
    this.styleOptionsData.push({ text: 'Diamond', value: '3' });
    this.styleOptionsData.push({ text: 'X', value: '4' });

    for (const item of this.styleOptionsData) {
      const optionItem = <HTMLOptionElement>document.createElement('option');
      optionItem.value = item.value;
      optionItem.text = item.text;
      this.selectPointStyle.nativeElement.appendChild(optionItem);
    }

    this.selectFontFamilyData.push({ text: 'Arial', value: 'Arial' });
    this.selectFontFamilyData.push({
      text: 'Arial Black',
      value: 'Arial Black'
    });
    this.selectFontFamilyData.push({ text: 'Calibri', value: 'Calibri' });
    this.selectFontFamilyData.push({
      text: 'Comic Sans MS',
      value: 'Comic Sans MS'
    });
    this.selectFontFamilyData.push({
      text: 'Courier New',
      value: 'Courier New'
    });
    this.selectFontFamilyData.push({ text: 'Georgia', value: 'Georgia' });
    this.selectFontFamilyData.push({
      text: 'Lucida Sans Unicode',
      value: 'Lucida Sans Unicode'
    });
    this.selectFontFamilyData.push({ text: 'MS Mincho', value: 'MS Mincho' });
    this.selectFontFamilyData.push({ text: 'MS PMincho', value: 'MS PMincho' });
    this.selectFontFamilyData.push({ text: 'SimSun', value: 'SimSun' });
    this.selectFontFamilyData.push({
      text: 'SimSun-ExtB',
      value: 'SimSun-ExtB'
    });
    this.selectFontFamilyData.push({
      text: 'Times New Roman',
      value: 'Times New Roman'
    });
    this.selectFontFamilyData.push({
      text: 'Trebuchet MS',
      value: 'Trebuchet MS'
    });
    this.selectFontFamilyData.push({ text: 'Verdana', value: 'Verdana' });

    for (const item of this.selectFontFamilyData) {
      const optionItem = <HTMLOptionElement>document.createElement('option');
      optionItem.value = item.value;
      optionItem.text = item.text;
      this.selectFontFamily.nativeElement.appendChild(optionItem);
    }
  }

  public ngAfterContentInit() {
    this.textMapDraw = this.memoryService.getItem('TextMapDraw');
  }

  ngAfterViewInit(): void {
    this.callOutBackgroundPic.setColor(
      this.memoryService.getItem('CallOutBackground').slice(-6)
    );

    this.callOutBorderColorPic.setColor(
      this.memoryService.getItem('CallOutBorderColor').slice(-6)
    );

    this.callOutFontColorPic.setColor(
      this.memoryService.getItem('CallOutFontColor').slice(-6)
    );

    this.callOutBorderRadius.value(
      this.memoryService.getItem('CallOutBorderRadius')
    );
    this.callOutFontSize.value(this.memoryService.getItem('CallOutFontSize'));

    this.pointColorPic.setColor(
      this.memoryService.getItem('PointColor').slice(-6)
    );

    this.tempLineColorPic.setColor(
      this.memoryService.getItem('TempLineColor').slice(-6)
    );

    this.tempFillColorPic.setColor(
      this.memoryService.getItem('TempFillColor').slice(-6)
    );

    this.lineColorPic.setColor(
      this.memoryService.getItem('LineColor').slice(-6)
    );

    this.fillColorPic.setColor(
      this.memoryService.getItem('FillColor').slice(-6)
    );

    this.pointSize.value(this.memoryService.getItem('PointSize'));
    this.tempLineWidth.value(this.memoryService.getItem('TempLineWidth'));
    this.tempBorderThickness.value(
      this.memoryService.getItem('TempBorderThickness')
    );
    this.borderThickness.value(this.memoryService.getItem('BorderThickness'));
    this.lineWidth.value(this.memoryService.getItem('LineWidth'));

    this.fontSize.value(this.memoryService.getItem('FontSize'));

    this.fontColorPic.setColor(
      this.memoryService.getItem('FontColor').slice(-6)
    );
  }

  getTextElementByColor(color: any): any {
    if (color === 'transparent' || color.hex === '') {
      return '<div style="text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;">transparent</div>';
    }
    const nThreshold = 105;
    const bgDelta = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
    const foreColor = 255 - bgDelta < nThreshold ? 'Black' : 'White';
    const element =
      '<div style="text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;color:' +
      foreColor +
      '; background: #' +
      color.hex +
      '">#' +
      color.hex +
      '</div>';
    return element;
  }

  colorPickerEvent(event: any, name: string): void {
    switch (name) {
      case 'callOutBackground':
        this.callOutBackground.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'callOutBorderColor':
        this.callOutBorderColor.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'callOutFontColor':
        this.callOutFontColor.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'pointColor':
        this.pointColor.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'tempLineColor':
        this.tempLineColor.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'tempFillColor':
        this.tempFillColor.setContent(
          this.getTextElementByColor(event.args.color)
        );
        break;
      case 'lineColor':
        this.lineColor.setContent(this.getTextElementByColor(event.args.color));
        break;
      case 'fillColor':
        this.fillColor.setContent(this.getTextElementByColor(event.args.color));
        break;
      case 'fontColor':
        this.fontColor.setContent(this.getTextElementByColor(event.args.color));
        break;
    }
  }

  executeSetParameters() {
    this.memoryService.setItem('TextMapDraw', this.textMapDraw);
    this.memoryService.setItem('FontFamily', this.selectFontFamilyOption);

    this.memoryService.setItem(
      'CallOutBackground',
      (<any>this.callOutBackgroundPic.getColor()).hex
    );
    this.memoryService.setItem(
      'CallOutBorderColor',
      (<any>this.callOutBorderColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'CallOutFontColor',
      (<any>this.callOutFontColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'CallOutBorderRadius',
      this.callOutBorderRadius.getDecimal().toString()
    );
    this.memoryService.setItem(
      'CallOutFontSize',
      this.callOutFontSize.getDecimal().toString()
    );
    this.memoryService.setItem(
      'PointColor',
      (<any>this.pointColorPic.getColor()).hex
    );
    this.memoryService.setItem('PointStyle', this.selectPointStyleOption);
    this.memoryService.setItem(
      'TempLineColor',
      (<any>this.tempLineColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'TempFillColor',
      (<any>this.tempFillColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'LineColor',
      (<any>this.lineColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'FillColor',
      (<any>this.fillColorPic.getColor()).hex
    );
    this.memoryService.setItem(
      'PointSize',
      this.pointSize.getDecimal().toString()
    );
    this.memoryService.setItem(
      'TempLineWidth',
      this.tempLineWidth.getDecimal().toString()
    );
    this.memoryService.setItem(
      'TempBorderThickness',
      this.tempBorderThickness.getDecimal().toString()
    );
    this.memoryService.setItem(
      'BorderThickness',
      this.borderThickness.getDecimal().toString()
    );
    this.memoryService.setItem(
      'LineWidth',
      this.lineWidth.getDecimal().toString()
    );
    // this.fontFamily.setContent(
    //   this.getTextElementByColor({
    //     hex: this.memoryService.getItem('FontFamily').slice(-6)
    //   })
    // );
    this.memoryService.setItem(
      'FontSize',
      this.fontSize.getDecimal().toString()
    );
    this.memoryService.setItem(
      'FontColor',
      (<any>this.fontColorPic.getColor()).hex
    );

    this.closeFunction();
  }
}
