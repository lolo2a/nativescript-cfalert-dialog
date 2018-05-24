import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";

export enum CFAlertStyle {
    NOTIFICATION = 0,
    ALERT = 1,
    BOTTOM_SHEET = 2
}

export enum CFAlertActionStyle {
    DEFAULT = 0,
    NEGATIVE = 1,
    POSITIVE = 2
}

export enum CFAlertActionAlignment {
    START = 0,
    END = 1,
    CENTER = 2,
    JUSTIFIED = 3
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
    backgroundBlur?: boolean; // iOS only
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
    simpleList?: {
        items: [string];
        onClick: Function; // Callback for onclick
    };
    singleChoiceList?: {
        items: [string];
        selectedItem: number;
        onClick: Function; // Callback for onclick
    };
    multiChoiceList?: {
        items: [string];
        selectedItems: [boolean];
        onClick: Function; // Callback for onclick
    };
}

declare const com: any;
declare const android: any;
const Builder = com.crowdfire.cfalertdialog.CFAlertDialog.Builder;

const notificationStyle =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertStyle.NOTIFICATION;
const alertStyle = com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertStyle.ALERT;
const bottomSheetStyle =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertStyle.BOTTOM_SHEET;
const styles = [notificationStyle, alertStyle, bottomSheetStyle];

const actionDefault =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionStyle.DEFAULT;
const actionNegative =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionStyle.NEGATIVE;
const actionPositive =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionStyle.POSITIVE;
const actionStyles = [actionDefault, actionNegative, actionPositive];

const alignStart =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionAlignment.START;
const alignEnd =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionAlignment.END;
const alignCenter =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionAlignment.CENTER;
const alignJustified =
    com.crowdfire.cfalertdialog.CFAlertDialog.CFAlertActionAlignment.JUSTIFIED;
const alignment = [alignStart, alignEnd, alignCenter, alignJustified];

const gravityStart = android.view.Gravity.START;
const gravityCenterHorizontal = android.view.Gravity.CENTER_HORIZONTAL;
const gravityEnd = android.view.Gravity.END;
const gravity = [gravityStart, gravityCenterHorizontal, gravityEnd];

class Listener implements android.content.DialogInterface.OnClickListener {
    public onClick(dialog, which) {
        dialog.dismiss();
    }
}

export class CFAlertDialog {
    private dialog:any;
    private timeoutPtr;

    public show(options: DialogOptions) {
        options = options || {
            title: "Hello World",
            dialogStyle: alertStyle
        };
        this.reset();
        const builder = new Builder(app.android.foregroundActivity);
        const that = this;

        if (typeof options.dialogStyle !== undefined) {
            builder.setDialogStyle(styles[options.dialogStyle]);
        }

        if (options.title) {
            builder.setTitle(options.title);
        }
        if (options.message) {
            builder.setMessage(options.message);
        }

        if (typeof options.textAlignment !== undefined) {
            builder.setTextGravity(gravity[options.textAlignment]);
        }

        if (options.backgroundColor) {
            builder.setBackgroundColor(
                new Color(options.backgroundColor).android
            );
        }
        if (options.textColor) {
            builder.setTextColor(new Color(options.textColor).android);
        }

        if (options.cancellable) {
            builder.setCancelable(options.cancellable);
        }

        if (options.headerView) {
            builder.setHeaderView(options.headerView);
        }
        if (options.footerView) {
            builder.setFooterView(options.footerView);
        }

        if (options.buttons) {
            for (let i = 0; i < options.buttons.length; i++) {
                const button = options.buttons[i];
                builder.addButton(
                    button.text,
                    -1,
                    -1,
                    actionStyles[button.buttonStyle],
                    alignment[button.buttonAlignment],
                    new android.content.DialogInterface.OnClickListener({
                        onClick: function(dialog, which) {
                            that.reset();
                            button.onClick(button.text);
                            dialog.dismiss();
                        }
                    })
                );
            }
        }

        if (options.simpleList) {
            builder.setItems(
                options.simpleList.items,
                new android.content.DialogInterface.OnClickListener({
                    onClick: (dialogInterface, index) => {
                        options.simpleList.onClick(dialogInterface, index);
                        dialogInterface.dismiss();
                    }
                })
            );
        }

        if (options.singleChoiceList) {
            builder.setSingleChoiceItems(
                options.singleChoiceList.items,
                options.singleChoiceList.selectedItem,
                new android.content.DialogInterface.OnClickListener({
                    onClick: (dialogInterface, index) => {
                        options.singleChoiceList.onClick(
                            dialogInterface,
                            index
                        );
                    }
                })
            );
        }

        if (options.multiChoiceList) {
            builder.setMultiChoiceItems(
                options.multiChoiceList.items,
                [false, false, false, false],
                new android.content.DialogInterface.OnMultiChoiceClickListener({
                    onClick: (dialogInterface, index, b) => {
                        options.multiChoiceList.onClick(
                            dialogInterface,
                            index,
                            b
                        );
                    }
                })
            );
        }

        const alertDialog = builder.show();
        this.dialog = alertDialog;

        if (options.titleColor) {
            alertDialog.setTitleColor(new Color(options.titleColor).android);
        }
        if (options.messageColor) {
            alertDialog.setMessageColor(
                new Color(options.messageColor).android
            );
        }
        if (options.onDismiss) {
            alertDialog.setOnDismissListener(
                new android.content.DialogInterface.OnDismissListener({
                    onDismiss: function() {
                        that.reset();
                        options.onDismiss();
                    }
                })
            );
        }

        if (options.delay)
        {
            this.timeoutPtr = setTimeout(() => { that.hide(); }, options.delay);
        }

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
            this.dialog.dismiss();

        this.reset();
    }


}
