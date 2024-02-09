import React, {useEffect, useRef, useState} from "react";
import {Button, Card, FileButton, Flex, Group, Image, Slider, Text} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {
    calcImgFixedSize,
    encodeImageToBase64,
    getImageDimensions,
    showErrorMessage,
    showInfoMessage, showWarningMessage
} from "../utils/utils.ts";
import {UseFormReturnType} from "@mantine/form";
import {backgroundStyle, maxWidth} from "../styles.ts";
import UpScaleButton from "./subs/UpScaleButton.tsx";


export default function Img2Img({form, setSelectValue, refreshCost, generating, startGenerate, file, setFile, fileURL, setFileURL, resetRef}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>,
    setSelectValue:  (v: string | null) => any, refreshCost: () => any,
    generating: boolean, startGenerate: (reqData: {[p: string]: any}) => any,
    file: File | null, setFile: (file: File | null) => any, fileURL: string | null, setFileURL: (url: string | null) => any,
    resetRef: React.RefObject<() => void>
}) {
    const setWHByImage = (file: File) => {
        getImageDimensions(file)
            .then((result) => {
                const fixedSize = calcImgFixedSize(result)
                form.setFieldValue("parameters.width", fixedSize.width)
                form.setFieldValue("parameters.height", fixedSize.height)
                setSelectValue(null)
            })
            .catch((e) => showErrorMessage(e.toString(), "获取图片参数失败"))
    }
    
    const onChangeFile = (file: File | null) => {
        if (!file) return
        if (file.size > 8 * 1024 * 1024) {
            showWarningMessage("图片不得超过 8MB", "图片过大")
            return
        }
        setFile(file)
        if (fileURL) URL.revokeObjectURL(fileURL)
        const url = URL.createObjectURL(new Blob([file], {type: file.type}))
        setFileURL(url)
        encodeImageToBase64(file)
            .then((value) => {
                form.setValues({action: "img2img"})
                form.setFieldValue("img2imgPara.image", value)
                refreshCost()
            })
            .catch((e) => showErrorMessage(e.toString(), "图片编码失败, 请检查图片格式"))
        setWHByImage(file)
    }

    const clearFile = () => {
        setFile(null)
        if (fileURL) {
            URL.revokeObjectURL(fileURL)
            setFileURL(null)
        }
        resetRef.current?.()
        form.setValues({action: "generate"})
        form.setFieldValue("img2imgPara.image", "")
        refreshCost()
    }

    return (
        <Card withBorder>
            <Card.Section>
                {fileURL && <Image src={fileURL} radius="sm" style={backgroundStyle} mah={180}
                                   fit="cover"/> }
            </Card.Section>

            <Flex gap="xs" justify="flex-start" align="flex-end" direction="column" wrap="wrap"
                  style={{marginTop: "8px"}}>
                <Group justify="space-between" style={maxWidth}>
                    <Text>图生图</Text>
                    <Group justify="end">
                        <FileButton resetRef={resetRef} onChange={onChangeFile}
                                    accept="image/png,image/jpeg">
                            {(props) => <Button {...props}>选择图片</Button>}
                        </FileButton>
                        <Button disabled={!file} color="red" onClick={clearFile}>
                            取消
                        </Button>
                    </Group>
                </Group>
                {file &&
                    <Flex justify="flex-start" align="flex-start" direction="column"
                          wrap="wrap"
                          style={maxWidth}>
                        <UpScaleButton imgUrl={fileURL} generating={generating} startGenerate={startGenerate} fullDisplay={true}
                                       fullWidth={true} hide={false}/>

                        <Text>Strength: <Text span fw={500}>{form.values.img2imgPara.strength}</Text></Text>
                        <Slider
                            style={maxWidth}
                            defaultValue={0.7}
                            min={0.01}
                            max={0.99}
                            label={(value) => value.toFixed(2)}
                            step={0.01}
                            {...form.getInputProps('img2imgPara.strength')}
                            onChange={(v) => {
                                form.getInputProps('img2imgPara.strength').onChange(v)
                                refreshCost()
                            }}
                        />
                        <Text>Noise: <Text span fw={500}>{form.values.img2imgPara.noise}</Text></Text>
                        <Slider
                            style={maxWidth}
                            defaultValue={0}
                            min={0.00}
                            max={0.99}
                            label={(value) => value.toFixed(2)}
                            step={0.01}
                            {...form.getInputProps('img2imgPara.noise')}
                            onChange={(v) => {
                                form.getInputProps('img2imgPara.noise').onChange(v)
                                refreshCost()
                            }}
                        />
                    </Flex>
                }

            </Flex>
        </Card>
    )
}
