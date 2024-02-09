import React, {useEffect, useRef, useState, useReducer} from "react";
import {
    ActionIcon,
    AppShell,
    Button,
    Card,
    CopyButton, Drawer,
    Flex,
    Group,
    Image,
    Modal,
    rem,
    ScrollArea
} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {BasePrompts, BaseRetData, UserData, Rect, SaveImageBlob} from "../utils/models.ts";
import {getDefaultFormInit, mWHValues} from "../utils/presets.ts";
import {getDrawRequestBody} from "../utils/requestFormat.ts";
import Icon from "@mdi/react";
import {mdiDelete, mdiDownload, mdiHistory, mdiSeed} from "@mdi/js";
import UserInfoHead from "../components/UserInfoHead.tsx";
import {apiGenerate, apiGetCost} from "../utils/api.ts";
import {
    downloadFile,
    getBlobImageDimensions,
    showErrorMessage,
    showWarningMessage
} from "../utils/utils.ts";
import {maxWidth, noMargin} from "../styles.ts";
import {useDisclosure} from "@mantine/hooks";
import DrawConfigs from "../components/DrawConfigs.tsx";
import GenerateHistory from "../components/GenerateHistory.tsx";
import GenerateButton from "../components/subs/GenerateButton.tsx";
import {confirmDelete} from "../components/subs/confirms.tsx";
import {recaptcha} from "./MainPage.tsx";
import UpScaleButton from "../components/subs/UpScaleButton.tsx";


type Action = { type: 'addFile' | 'removeFile' | 'clear' | 'replace' | 'noEdit'; payload?: SaveImageBlob; index?: number; newPayload?: SaveImageBlob[] }

function genSaveImageBlob(data: Blob, seed: number, url: string) {
    return {
        data: data,
        url: url,
        seed: seed
    }
}

function fileArrayChange(state: SaveImageBlob[], action: Action): SaveImageBlob[] {
    switch (action.type) {
        case 'addFile':
            if (action.payload) {
                return [action.payload, ...state]
            } break
        case 'removeFile':
            if (action.index !== undefined) {
                // return state.toSpliced(action.index, 1)
                return [...state.slice(0, action.index), ...state.slice(action.index + 1)]
            } break
        case 'replace':
            if (action.newPayload !== undefined) {
                return action.newPayload
            } break
        case 'clear':
            return []
        default:
            return state;
    }
    return state
}

const NAVBAR_BREAKPOINT = 1000

export default function DrawPage({pageTypeSet, userData, refreshUserData, refreshLeftPoint}: {pageTypeSet: (pageType: PageType) => void,
    userData: UserData, refreshUserData: () => any, refreshLeftPoint: () => any}) {

    const getFormInit = (): BasePrompts => {
        const defaultRet = getDefaultFormInit()
        const promptsCacheStr = localStorage.getItem("promptsCache")
        if (promptsCacheStr) {
            const promptsCache = JSON.parse(promptsCacheStr)
            const checkTwoKey = (obj1: any, obj2: any) => {
                const keys1 = Object.keys(obj1)
                const keys2 = Object.keys(obj2)
                return keys1.length === keys2.length && keys1.every(key => keys2.includes(key))
            }
            if (checkTwoKey(defaultRet, promptsCache) &&
                checkTwoKey(defaultRet.parameters, promptsCache.parameters) &&
                checkTwoKey(defaultRet.img2imgPara, promptsCache.img2imgPara) &&
                checkTwoKey(defaultRet.advanced, promptsCache.advanced) &&
                checkTwoKey(defaultRet.otherSets, promptsCache.otherSets)
            ) {
                return promptsCache
            }
            else {
                localStorage.removeItem("promptsCache")
                showWarningMessage("检测到数据格式更新，已清除缓存。", "输入缓存已清除", 10000)
            }
        }
        return defaultRet
    }

    const form = useForm<BasePrompts>({
        initialValues: getFormInit()
    })
    const currentFormValueRef = useRef(form.values)

    const [drawerOpened, { open, close }] = useDisclosure(false);
    const [historyOpened, { open: historyOpen, close: historyClose }] = useDisclosure(false);
    const [usePresetResolution, setUsePresetResolution] = useState(true)
    const [resolutionSelectValue, setResolutionSelectValue] = useState<string | null>("NP")
    const cardRef = useRef<HTMLDivElement | null>(null)
    const imgCardSectionRef = useRef<HTMLDivElement | null>(null)
    const imgCardEndAreaRef = useRef<HTMLDivElement | null>(null)
    const imgFatherRef = useRef<HTMLDivElement | null>(null)
    // const fatherGroupRef = useRef<HTMLDivElement | null>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    // const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerHeight)
    // const [cardWidth, setCardWidth] = useState(0)
    // const [fatherGroupWidth, setFatherGroupWidth] = useState(0)
    const [imgCardSectionH, setImgCardSectionH] = useState(0)
    const [imgCardEndAreaH, setImgCardEndAreaH] = useState(0)
    const [burgerDisplay, setBurgerDisplay] = useState(false)

    const [lastImageSeed, setLastImageSeed] = useState(-1)
    const [generating, setGenerating] = useState(false)
    const [currentImageURL, setCurrentImageURL] = useState<string | null>(null)

    const [currentCost, setCurrentCost] = useState(1)
    const [refreshingCost, setRefreshingCost] = useState(false)
    const [historyFiles, dispatcHistoryFiles] = useReducer(fileArrayChange, [])

    const [file, setFile] = useState<File | null>(null)
    const [fileURL, setFileURL] = useState<string | null>(null)
    const resetRef = useRef<() => void>(null)

    const updateImageSize = (imgVec?: Rect) => {
        const img = imgRef.current
        const imgFather = imgFatherRef.current
        if (!img || !imgFather) return
        // const imgFatherSize = imgFather.getBoundingClientRect()
        let imgW: number
        let imgH: number
        if (imgVec) {
            imgW = imgVec.width
            imgH = imgVec.height
        }
        else {
            imgW = img.naturalWidth
            imgH = img.naturalHeight
        }

        const displayH = imgFather.clientHeight - 5
        imgW = imgW * displayH / imgH
        imgH = displayH
        const displayW = imgFather.clientWidth
        if (imgW > displayW) {
            imgW = displayW
            imgH = imgH * displayW / imgW
        }
        img.style.width = `${imgW}px`
        img.style.height = `${imgH}px`
    }

    useEffect(() => {
        currentFormValueRef.current = form.values
    }, [form.values]);

    const updateCurrentImageURL = (url: string | null) => {
        setCurrentImageURL(url)
        if (url) {
            getBlobImageDimensions(url)
                .then((result) => {
                    updateImageSize(result)
                })
        }
    }

    const handleResize = () => {
        const windowWidth = window.innerWidth
        const showBurger = windowWidth <= NAVBAR_BREAKPOINT
        setBurgerDisplay(showBurger)
        // setWidth(windowWidth);
        setHeight(window.innerHeight);
        // if (cardRef.current) {
        //     const newWidth = cardRef.current.getBoundingClientRect().width;
        //     setCardWidth(newWidth);
        // }
        if (imgCardSectionRef.current) {
            setImgCardSectionH(imgCardSectionRef.current.getBoundingClientRect().height)
        }
        if (imgCardEndAreaRef.current) {
            setImgCardEndAreaH(imgCardEndAreaRef.current.getBoundingClientRect().height)
        }
        // if (fatherGroupRef.current) {
        //     setFatherGroupWidth(fatherGroupRef.current.getBoundingClientRect().width)
        // }
        requestAnimationFrame(() => updateImageSize())
    }

    const refreshCost = async (formValuesRef:  React.MutableRefObject<BasePrompts>): Promise<number> => {
        return new Promise((resolve, reject) => {
            setRefreshingCost(true)
            console.log(formValuesRef.current)
            const reqData = getDrawRequestBody(formValuesRef.current)
            apiGetCost(reqData)
                .then((result) => {
                    if (result.success) {
                        setCurrentCost(result.cost)
                        resolve(result.cost)
                    }
                    else {
                        showErrorMessage(result.msg, "获取消耗失败")
                        resolve(-1)
                    }
                })
                .catch((e) => {
                    showErrorMessage(e.toString(), "获取消耗出错")
                    reject(e)
                })
                .finally(() => setRefreshingCost(false))
        })
    }

    useEffect(() => {
        handleResize()
        updateImageSize()
        refreshCost(currentFormValueRef)
        window.addEventListener('resize', handleResize)
        recaptcha.hideBandage()
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const downloadCurrentImage = () => {
        if (currentImageURL) {
            downloadFile(currentImageURL, `aidraw-${lastImageSeed}.png`)
        }
    }

    const deleteImage = (index: number) => {
        confirmDelete("删除历史图片", "删除后不可恢复，确定要删除吗？", () => {
            if (index == 0) {
                if (historyFiles.length > 1) {
                    updateCurrentImageURL(URL.createObjectURL(historyFiles[1].data))
                    setLastImageSeed(historyFiles[1].seed)
                }
                else {
                    updateCurrentImageURL(null)
                    setLastImageSeed(-1)
                }
            }
            else if (index == -1145) {
                dispatcHistoryFiles({type: "clear"})
                return
            }
            dispatcHistoryFiles({type: "removeFile", index: index})
        })
    }

    const moveImageToFirst = (index: number) => {
        const target = historyFiles[index]
        const newArr = [...historyFiles.slice(0, index), ...historyFiles.slice(index + 1)]
        newArr.unshift(target)
        // const target = historyFiles[index]
        // const newArr = [target, ...historyFiles.toSpliced(index, 1)]
        updateCurrentImageURL(target.url)
        setLastImageSeed(target.seed)
        dispatcHistoryFiles({type: "replace", newPayload: newArr})
    }

    const doGenerate = async (reqData: {[p: string]: any}, retry: number = 0): Promise<number> => {
        return new Promise((resolve, reject) => {
            apiGenerate(reqData)
                .then((result) => {
                    if (result.status != 200) {
                        const returnResult = (if_err_msg: string) => {
                            if (result.status < 500) {
                                reject(if_err_msg)
                                return
                            }
                            if (retry <= 5) {
                                // showInfoMessage(retry.toString(), "重试")
                                setTimeout(() => {
                                    doGenerate(reqData, retry + 1)
                                        .then((result) => resolve(result))
                                        .catch((e) => reject(e))
                                }, 5000)
                            }
                            else {
                                // showErrorMessage(if_err_msg, "生成失败", 5000)
                                reject(`生成失败：达到最大重试次数 (${if_err_msg})`)
                            }
                        }

                        result.json()
                            .then((resultJson: BaseRetData) => {
                                returnResult(resultJson.msg)
                            })
                            .catch((e) => {
                                returnResult(e.toString())
                            })
                    }
                    else {
                        setLastImageSeed(reqData.parameters.seed)
                        result.blob().then((data) => {
                            if (data.type.startsWith("image")) {
                                const imgURL = URL.createObjectURL(data)
                                updateCurrentImageURL(imgURL)
                                // for (let i = 0; i < 60; i++)  // 测试用
                                dispatcHistoryFiles({type: "addFile", payload: genSaveImageBlob(data, reqData.parameters.seed, imgURL)})
                            }
                            else {
                                showErrorMessage(`未知的 Blob type: ${data.type}`, "生成异常")
                            }
                        })
                        resolve(1)
                    }
                })
                .catch((e) => {
                    reject(e)
                })
        })
    }

    const startGenerate = (reqData: {[p: string]: any}) => {
        setGenerating(true)
        doGenerate(reqData)
            .catch((e) => showErrorMessage(e.toString(), "生成出错"))
            .finally(() => {
                refreshLeftPoint()
                setGenerating(false)
            })
    }

    const onClickGenerate = (values: BasePrompts) => {
        const reqData = getDrawRequestBody(values)
        console.log(reqData)
        localStorage.setItem("promptsCache", JSON.stringify(values, (key, value) => {
            if (key === 'img2imgPara') {
                return {...value, image: ""}
            }
            else if (key === "action") {
                return "generate"
            }
            return value
        }))
        startGenerate(reqData)
    }

    const onResolutionSetChange = (value: string | null) => {
        setResolutionSelectValue(value)
        form.setFieldValue("otherSets.resolutionSelect", value)
        if (!value) {
            setUsePresetResolution(false)
            return
        }
        setUsePresetResolution(true)
        const result = mWHValues[value]
        form.setFieldValue("parameters.width", result[0])
        form.setFieldValue("parameters.height", result[1])
    }

    /*<Card shadow="sm" padding="0" radius="md" withBorder mah={height}>*/
    return (
        <AppShell navbar={{width: 450, breakpoint: `${NAVBAR_BREAKPOINT}px`, collapsed: {mobile: true}}}>
            {/*<Group justify="space-between" preventGrowOverflow={false} ref={fatherGroupRef}>*/}
            {/*<Flex justify="flex-start" align="center" direction="row" wrap="wrap">*/}

            <AppShell.Navbar>
                {!drawerOpened && <ScrollArea style={noMargin}>
                    <DrawConfigs form={form} onResolutionSetChange={onResolutionSetChange}
                                 resolutionSelectValue={resolutionSelectValue}
                                 usePresetResolution={usePresetResolution} cardRef={cardRef} height={height}
                                 generating={generating} refreshingCost={refreshingCost} plusH={0} startGenerate={startGenerate}
                                 onClickGenerate={onClickGenerate} onClickRefreshCost={() => refreshCost(currentFormValueRef)}
                                 cost={currentCost} file={file} setFile={setFile} fileURL={fileURL} setFileURL={setFileURL}
                                 resetRef={resetRef}/>
                </ScrollArea>}
            </AppShell.Navbar>

            <Drawer opened={drawerOpened} onClose={close} title="参数设置">
                <DrawConfigs form={form} onResolutionSetChange={onResolutionSetChange} resolutionSelectValue={resolutionSelectValue}
                             usePresetResolution={usePresetResolution} cardRef={cardRef} height={height} generating={generating}
                             onClickGenerate={onClickGenerate} onClickRefreshCost={() => refreshCost(currentFormValueRef)}
                             cost={currentCost} refreshingCost={refreshingCost} plusH={70} startGenerate={startGenerate}
                             file={file} setFile={setFile} fileURL={fileURL} setFileURL={setFileURL} resetRef={resetRef}/>
            </Drawer>

            <Modal opened={historyOpened} onClose={historyClose} title="生成历史" size="900px" centered>
                <GenerateHistory historyFiles={historyFiles} deleteImage={deleteImage} onClose={historyClose}
                                 moveImageToFirst={moveImageToFirst}/>
            </Modal>

            <AppShell.Main>
                {/*<Card withBorder radius="false" w={fatherGroupWidth - cardWidth - 20} miw={200} h={height - 8} style={{flex: 1, ...noMargin}}>*/}
                <Card withBorder radius="false" h={height - 8}>
                    <Card.Section withBorder inheritPadding py="xs" ref={imgCardSectionRef}>
                        <UserInfoHead userData={userData} refreshUserData={refreshUserData} pageTypeSet={pageTypeSet}
                                      drawerOpened={drawerOpened} burgerDisplay={burgerDisplay} open={open}/>
                    </Card.Section>

                    <Flex justify="center" align="center" direction="column" wrap="wrap" style={{flex: 1}}
                          mah={height - 10 - imgCardSectionH - imgCardEndAreaH} ref={imgFatherRef}>
                        <Image src={currentImageURL} ref={imgRef}/>
                    </Flex>

                    <Group justify="center" ref={imgCardEndAreaRef}>
                        <Group justify="center" grow preventGrowOverflow={false} style={maxWidth}>
                            <UpScaleButton imgUrl={currentImageURL} generating={generating} startGenerate={startGenerate}
                                           fullDisplay={!burgerDisplay} fullWidth={false} hide={!burgerDisplay}/>
                            <GenerateButton generating={generating} onClickGenerate={onClickGenerate} form={form} hide={!burgerDisplay} fullWidth={false}
                                            cost={currentCost} onClickRefreshCost={() => refreshCost(currentFormValueRef)} refreshingCost={refreshingCost}/>
                        </Group>
                        <Group justify="space-between" style={maxWidth}>
                            <Group justify="space-between">
                                <ActionIcon variant="filled" color="red" onClick={() => deleteImage(0)} size="lg">
                                    <Icon path={mdiDelete} style={{ width: rem(18), height: rem(18) }}/>
                                </ActionIcon>
                                <UpScaleButton imgUrl={currentImageURL} generating={generating} startGenerate={startGenerate} fullDisplay={!burgerDisplay}
                                               fullWidth={false} hide={burgerDisplay}/>
                            </Group>
                            <Group>
                                <ActionIcon variant="default" onClick={() => downloadCurrentImage()} size="lg"
                                        disabled={!currentImageURL}>
                                    <Icon path={mdiDownload} style={{ width: rem(18), height: rem(18) }}/>
                                </ActionIcon>
                                <ActionIcon variant="default" onClick={historyOpen} size="lg">
                                    <Icon path={mdiHistory} style={{ width: rem(18), height: rem(18) }}/>
                                </ActionIcon>
                                <CopyButton value={`${lastImageSeed}`}>
                                    {({copied, copy}) => (
                                        <Button color={copied ? 'teal' : 'blue'} onClick={copy} size="xs"
                                                leftSection={<Icon path={mdiSeed} style={{ width: rem(18), height: rem(18) }}/>}>
                                            {copied ? `已复制` : `${lastImageSeed}`}
                                        </Button>
                                    )}
                                </CopyButton>
                        </Group>
                        </Group>
                    </Group>
                </Card>
            </AppShell.Main>


            {/*</Flex>*/}
        </AppShell>
    );
}
