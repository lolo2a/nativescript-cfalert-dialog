import * as frame from "tns-core-modules/ui/frame";
import { Color } from "tns-core-modules/color";
import { ios } from "tns-core-modules/ui/utils";
import { layout } from "tns-core-modules/utils/utils";
import { View } from "tns-core-modules/ui/core/view";
import { screen, device } from "tns-core-modules/platform";

declare const CFAlertViewController;
declare const CFAlertAction;
declare const CFAlertControllerBackgroundStyle;

export enum CFAlertStyle {
    NOTIFICATION = 2,
    ALERT = 0,
    BOTTOM_SHEET = 1
}

export enum CFAlertActionStyle {
    DEFAULT = 1,
    NEGATIVE = 2,
    POSITIVE = 0
}

export enum CFAlertActionAlignment {
    START = 2,
    END = 1,
    CENTER = 3,
    JUSTIFIED = 0
}

export enum CFAlertGravity {
    START = 0,
    CENTER_HORIZONTAL = 1,
    END = 2
}

export interface DialogOptions {
    dialogStyle: CFAlertStyle;
    title: string;
    titleColor?: string;
    message?: string;
    messageColor?: string;
    textColor?: string;
    textAlignment?: CFAlertGravity;
    delay?: number;
    backgroundColor?: string;
    backgroundBlur?: boolean;
    cancellable?: boolean;
    headerView?: any; // nativeView
    footerView?: any; // nativeView
    onDismiss?: Function; // Callback for dismiss
    buttons?: [
        {
            text: string; // title
            buttonStyle: CFAlertActionStyle;
            buttonAlignment?: CFAlertActionAlignment;
            textColor?: string;
            backgroundColor?: string;
            onClick: Function;
        }
    ];
    simpleList?: any; // android only
    singleChoiceList?: any; // android only
    multiChoiceList?: any; // android only.
}

export class CFAlertDialog {
    private dialog:any;
    private timeoutPtr;

    public show(options: DialogOptions) {

        this.reset();
        const that = this;

        if (
            options.simpleList ||
            options.singleChoiceList ||
            options.multiChoiceList
        ) {
            alert("Lists are not available on iOS.");
            return;
        }
        if (!options.dialogStyle) options.dialogStyle = CFAlertStyle.ALERT;
        if (!options.title) options.title = "Hello world!";
        if (!options.titleColor) {
            options.titleColor = new Color("black").ios;
        } else {
            options.titleColor = new Color(options.titleColor).ios;
        }
        if (options.messageColor)
            options.messageColor = new Color(options.messageColor).ios;
        if (typeof options.textAlignment === undefined)
            options.textAlignment = CFAlertGravity.START;


        const viewController = frame.topmost().currentPage.ios;
        const alertController = CFAlertViewController.alloc().initWithTitleTitleColorMessageMessageColorTextAlignmentPreferredStyleHeaderViewFooterViewDidDismissAlertHandler(
            options.title,
            options.titleColor,
            options.message,
            options.messageColor,
            options.textAlignment,
            options.dialogStyle,
            options.headerView,
            options.footerView,
            () => {
                that.reset();
                if (options.onDismiss) options.onDismiss();
            }
        );

        this.dialog = alertController;

        if (options.backgroundBlur) {
            alertController.backgroundStyle =
                CFAlertControllerBackgroundStyle.Blur;
        } else {
            alertController.backgroundStyle =
                CFAlertControllerBackgroundStyle.Plain;
        }
        if (options.backgroundColor)
            alertController.backgroundColor = new Color(
                options.backgroundColor
            ).ios;
        if (options.buttons) {
            for (let x = 0; options.buttons.length > x; x++) {
                const btnOpts = options.buttons[x];
                if (!btnOpts.buttonAlignment)
                    btnOpts.buttonAlignment = CFAlertActionAlignment.JUSTIFIED;
                if (btnOpts.textColor)
                    btnOpts.textColor = new Color(btnOpts.textColor).ios;
                if (btnOpts.backgroundColor)
                    btnOpts.backgroundColor = new Color(
                        btnOpts.backgroundColor
                    ).ios;
                const btn = CFAlertAction.alloc().initWithTitleStyleAlignmentBackgroundColorTextColorHandler(
                    btnOpts.text,
                    btnOpts.buttonStyle,
                    btnOpts.buttonAlignment,
                    btnOpts.backgroundColor,
                    btnOpts.textColor,
                    action => {
                        that.reset();
                        btnOpts.onClick(action.title);
                    }
                );
                alertController.addAction(btn);
            }
        }

        viewController.presentViewControllerAnimatedCompletion(
            alertController,
            true,
            () => {
                if (options.delay)
                {
                    that.timeoutPtr = setTimeout(() => { that.hide(); }, options.delay);
                }
            }
        );
    }

    private reset(): void
    {
        this.dialog = null;
        if (this.timeoutPtr > 0) clearTimeout(this.timeoutPtr);
        this.timeoutPtr = 0;
    }
    
    hide(): void
    {
        if (this.dialog)
            this.dialog.dismissAlertWithAnimationCompletion(true, () => {});

        this.reset();
    }
}
