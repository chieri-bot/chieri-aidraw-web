import React, {useEffect, useState} from "react";
import {Button, Group, rem, Tooltip} from "@mantine/core";
import {Rect} from "../../utils/models.ts";
import {
    calcImgFixedSize,
    encodeImageURLToBase64,
    getBlobImageDimensions, resizeImage,
    showErrorMessage
} from "../../utils/utils.ts";
import Icon from "@mdi/react";
import {mdiArrowExpand} from "@mdi/js";


const UPSCALE = 4

export default function UpScaleButton({imgUrl, generating, startGenerate, fullWidth, hide}: {
    imgUrl: string | null, generating: boolean, startGenerate: (reqData: {[p: string]: any}) => any, fullWidth: boolean, hide: boolean
}) {
    const [canUpscale, setCanUpscale] = useState(false)
    const [origImgSize, setOrigImgSize] = useState<Rect>({width: -1, height: -1})
    const [fixedImgSize, setFixedOrigImgSize] = useState<Rect>({width: -1, height: -1})

    const getFixedSize = async (imgUrl: string): Promise<Rect[]> => {
        return new Promise((resolve, reject) => {
            getBlobImageDimensions(imgUrl)
                .then((result) => {
                    resolve([result, calcImgFixedSize(result)])
                })
                .catch((e) => {
                    showErrorMessage(e.toString(), "获取图片分辨率失败")
                    reject(e)
                })
        })
    }

    useEffect(() => {
        console.log(imgUrl)
        if (imgUrl) {
            getFixedSize(imgUrl).then((result) => {
                const origSize = result[0]
                const fixedSize = result[1]
                setOrigImgSize(origSize)
                setFixedOrigImgSize(fixedSize)
                if ((fixedSize.width * UPSCALE * fixedSize.height * UPSCALE) <= (origSize.width * origSize.height)) {
                    setCanUpscale(false)
                }
                else {
                    setCanUpscale(true)
                }
            })
        }
        else {
            setCanUpscale(false)
        }

    }, [imgUrl])

    const startRescale = (imgB64: string, fixedSize: Rect) => {
        startGenerate({
            action: "upscale_chieri",
            image: imgB64,
            height: fixedSize.height,
            width: fixedSize.width,
            scale: 4,
            parameters: {
                seed: -1
            }
        })
    }

    const onClickUpscale = (imgUrl: string | null) => {
        if (imgUrl) {
            getFixedSize(imgUrl)
                .then((result) => {
                    const origSize = result[0]
                    const fixedSize = result[1]
                    if ((fixedSize.width * UPSCALE * fixedSize.height * UPSCALE) <= (origSize.width * origSize.height)) {
                        showErrorMessage("图片分辨率过大", "错误")
                    }
                    else {
                        if (origSize.width * origSize.height > fixedSize.width * fixedSize.height) {
                            resizeImage(imgUrl, fixedSize)
                                .then((newImgUrl) => {
                                    encodeImageURLToBase64(newImgUrl)
                                        .then((imgB64) => {
                                            startRescale(imgB64, fixedSize)
                                        })
                                        .catch((e) => showErrorMessage(e.toString(), "图片编码出错"))
                                })
                        }
                        else {
                            encodeImageURLToBase64(imgUrl)
                                .then((imgB64) => {
                                    startRescale(imgB64, fixedSize)
                                })
                                .catch((e) => showErrorMessage(e.toString(), "图片编码出错"))
                        }

                    }
                })
        }
    }

    return (
        <Tooltip label={`(${origImgSize.width}, ${origImgSize.height}) => (${fixedImgSize.width * UPSCALE}, ${fixedImgSize.height * UPSCALE})`}>
            <Button disabled={!canUpscale || generating} loading={generating} fullWidth={fullWidth} display={hide ? "none" : "unset"}
                    onClick={() => onClickUpscale(imgUrl)} justify="space-between"
                    leftSection={
                        <Group>{!fullWidth &&
                            <Icon path={mdiArrowExpand} style={{ width: rem(18), height: rem(18) }}/>
                        }
                            超分
                        </Group>
                    }
                    rightSection={
                            <Button variant="outline" color="white" size="xs" disabled={!canUpscale}>
                                消耗: 2
                            </Button>
                    }/>
        </Tooltip>
    )
}
