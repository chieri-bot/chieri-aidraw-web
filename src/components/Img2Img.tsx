import React, {useRef, useState} from "react";
import {Button, Card, FileButton, Flex, Group, Image, Slider, Text} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {encodeImageToBase64, getImageDimensions, showErrorMessage} from "../utils/utils.ts";
import {UseFormReturnType} from "@mantine/form";
import {backgroundStyle, maxWidth} from "../styles.ts";


export default function Img2Img({form, setSelectValue, refreshCost}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>,
    setSelectValue:  (v: string | null) => any, refreshCost: () => any
}) {
    const [file, setFile] = useState<File | null>(null)
    const [fileURL, setFileURL] = useState<string | null>(null)
    const resetRef = useRef<() => void>(null)
    
    const setWHByImage = (file: File) => {
        getImageDimensions(file)
            .then((result) => {
                const setWH = {width: 832, height: 1216}
                if (result.width > result.height) {
                    setWH.width = 1216
                    setWH.height = 832
                }
                if (result.width > setWH.width || result.height > setWH.height) {
                    const ratio = Math.min(setWH.width / result.width, setWH.height / result.height)
                    result.width = result.width * ratio
                    result.height = result.height * ratio
                }
                result.width = Math.round(result.width / 64) * 64
                result.height = Math.round(result.height / 64) * 64
                form.setFieldValue("parameters.width", result.width)
                form.setFieldValue("parameters.height", result.height)
                setSelectValue(null)
            })
            .catch((e) => showErrorMessage(e.toString(), "获取图片参数失败"))
    }
    
    const onChangeFile = (file: File | null) => {
        if (!file) return
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
