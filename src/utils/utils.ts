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
        reader.onloadend = function() {
            if (typeof reader.result === 'string') {
                resolve(reader.result.replace(/^data:image\/\w+;base64,/, ''));
            } else {
                reject(new Error('Failed to read Blob as base64'));
            }
        };
        reader.readAsDataURL(file);
    })
}

export async function encodeImageURLToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (xhr.status === 200) {
                encodeImageToBase64(xhr.response)
                    .then((r) => resolve(r))
                    .catch((e) => reject(e))
            } else {
                reject(new Error('Failed to fetch Blob data'));
            }
        };
        xhr.onerror = function() {
            reject(new Error('XHR request failed'));
        };
        xhr.send();
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

export function calcImgFixedSize(imgSize: Rect) {
    const setWH = {width: 832, height: 1216}
    const ret: Rect = {width: -1, height: -1}
    if (imgSize.width > imgSize.height) {
        setWH.width = 1216
        setWH.height = 832
    }
    if (imgSize.width > setWH.width || imgSize.height > setWH.height) {
        const ratio = Math.min(setWH.width / imgSize.width, setWH.height / imgSize.height)
        ret.width = imgSize.width * ratio
        ret.height = imgSize.height * ratio
    }
    else {
        ret.width = imgSize.width
        ret.height = imgSize.height
    }
    ret.width = Math.round(ret.width / 64) * 64
    ret.height = Math.round(ret.height / 64) * 64
    return ret
}

export async function resizeImage(blobUrl: string, targetSize: Rect): Promise<string> {
    const image = new Image();
    image.src = blobUrl;

    await new Promise(resolve => {
        image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetSize.width;
    canvas.height = targetSize.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Failed to create Blob'));
                return;
            }
            const newBlobUrl = URL.createObjectURL(blob);
            resolve(newBlobUrl);
        });
    });
}
