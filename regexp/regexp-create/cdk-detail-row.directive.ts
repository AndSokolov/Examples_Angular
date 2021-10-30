import { Directive, HostBinding, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[appCdkDetailRow]'
})
export class CdkDetailRowDirective {
	private row: any;
	private tRef: TemplateRef<any>;
	private opened: boolean;

	/** saves the current row */
	@Input()
	set appCdkDetailRow(value: any) {
		if (value !== this.row) {
			this.row = value;
		}
	}


	/** saves the current template for the current row. Expands rows by default */
	@Input('appCdkDetailRowTpl')
	set template(value: TemplateRef<any>) {
		if (value !== this.tRef) {
			this.tRef = value;
		}
		if (this.row && this.tRef && this.row.defaultExpand) {
			this.toggle();
		}
	}

	constructor(public vcRef: ViewContainerRef) { }

	@HostListener('click')
	onClick(): void {
		this.toggle();
	}

	/** opens (renders) or closes a row */
	toggle(): void {
		if (this.opened) {
			this.vcRef.clear();
		} else {
			this.render();
		}
		this.opened = this.vcRef.length > 0;
	}

	/** renders (expands the grouped) row */
	private render(): void {
		this.vcRef.clear();
		if (this.tRef && this.row) {
			this.vcRef.createEmbeddedView(this.tRef, { $implicit: this.row });
		}
	}
}
