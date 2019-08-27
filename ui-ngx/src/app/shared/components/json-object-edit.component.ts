///
/// Copyright © 2016-2019 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {
  Attribute,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validator, NG_VALIDATORS } from '@angular/forms';
import * as ace from 'ace-builds';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'tb-json-object-edit',
  templateUrl: './json-object-edit.component.html',
  styleUrls: ['./json-object-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonObjectEditComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JsonObjectEditComponent),
      multi: true,
    }
  ]
})
export class JsonObjectEditComponent implements OnInit, ControlValueAccessor, Validator {

  @ViewChild('jsonEditor', {static: true})
  jsonEditorElmRef: ElementRef;

  private jsonEditor: ace.Ace.Editor;

  @Input() label: string;

  @Input() disabled: boolean;

  @Input() fillHeight: boolean;

  private requiredValue: boolean;
  get required(): boolean {
    return this.requiredValue;
  }
  @Input()
  set required(value: boolean) {
    this.requiredValue = coerceBooleanProperty(value);
  }

  private readonlyValue: boolean;
  get readonly(): boolean {
    return this.readonlyValue;
  }
  @Input()
  set readonly(value: boolean) {
    this.readonlyValue = coerceBooleanProperty(value);
  }

  fullscreen = false;

  modelValue: any;

  contentValue: string;

  objectValid: boolean;

  private propagateChange = null;

  constructor() {
  }

  ngOnInit(): void {
    const editorElement = this.jsonEditorElmRef.nativeElement;
    let editorOptions: Partial<ace.Ace.EditorOptions> = {
      mode: 'ace/mode/json',
      theme: 'ace/theme/github',
      showGutter: true,
      showPrintMargin: false,
      readOnly: this.readonly
    };

    const advancedOptions = {
      enableSnippets: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    };

    editorOptions = {...editorOptions, ...advancedOptions};
    this.jsonEditor = ace.edit(editorElement, editorOptions);
    this.jsonEditor.session.setUseWrapMode(false);
    this.jsonEditor.setValue(this.contentValue ? this.contentValue : '', -1);
    this.jsonEditor.on('change', () => {
      this.updateView();
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public validate(c: FormControl) {
    return (this.objectValid) ? null : {
      jsonParseError: {
        valid: false,
      },
    };
  }

  writeValue(value: any): void {
    this.modelValue = value;
    this.contentValue = '';
    this.objectValid = false;
    try {
      if (this.modelValue) {
        this.contentValue = JSON.stringify(this.modelValue, undefined, 2);
        this.objectValid = true;
      } else {
        this.objectValid = !this.required;
      }
    } catch (e) {
      //
    }
    if (this.jsonEditor) {
      this.jsonEditor.setValue(this.contentValue ? this.contentValue : '', -1);
    }
  }

  updateView() {
    const editorValue = this.jsonEditor.getValue();
    if (this.contentValue !== editorValue) {
      this.contentValue = editorValue;
      let data = null;
      this.objectValid = false;
      if (this.contentValue && this.contentValue.length > 0) {
        try {
          data = JSON.parse(this.contentValue);
          this.objectValid = true;
        } catch (ex) {}
      } else {
        this.objectValid = !this.required;
      }
      this.propagateChange(data);
    }
  }

  onFullscreen() {
    if (this.jsonEditor) {
      setTimeout(() => {
        this.jsonEditor.resize();
      }, 0);
    }
  }

}