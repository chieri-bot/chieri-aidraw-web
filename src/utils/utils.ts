import {notifications} from "@mantine/notifications";
import {Rect} from "./models.ts";

export function showErrorMessage(msg: string, title: string = "Error", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'red',
        autoClose: autoClose
    })
}

export function showWarningMessage(msg: string, title: string = "注意", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'yellow',
        autoClose: autoClose,
    })
}

export function showInfoMessage(msg: string, title: string = "Info", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'blue',
        autoClose: autoClose,
    })
}

export async function getImageDimensions(file: File): Promise<Rect> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                resolve({ width: image.width, height: image.height });
            };
            image.src = e.target?.result as string;
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

export async function getBlobImageDimensions(file: Blob | string): Promise<Rect> {
    return new Promise((resolve, reject) => {
        if (file instanceof Blob) {
            file = URL.createObjectURL(file)
        }
        const image = new Image()
        image.onload = () => {
            resolve({ width: image.width, height: image.height })
        }
        image.onerror = (error) => {
            reject(error);
        }
        image.src = file
    })

}

export async function encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) {
                    reject(new Error('Canvas context is null.'));
                    return;
                }
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, image.width, image.height);
                const base64String = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '')
                resolve(base64String);
            };
            image.src = e.target?.result as string;
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function timestampToDateString(timestampMS: number, needSec?: boolean): string {
    const date = new Date(timestampMS);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}${needSec ? `:${seconds}` : ''}`;
}

export function downloadFile(url: string, fileName: string) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

export function jumpToLink(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link)
    link.click();
    document.removeChild(link)
}
