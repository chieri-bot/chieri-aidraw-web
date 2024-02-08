import React, {useRef} from "react";
import {
    Card,
    Flex,
    Group,
    ScrollArea,
} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {UseFormReturnType} from "@mantine/form";
import {noMargin} from "../styles.ts";
import ModelSelect from "./ModelSelect.tsx";
import PromptSelect from "./PromptSelect.tsx";
import Img2Img from "./Img2Img.tsx";
import ResolutionSettings from "./ResolutionSettings.tsx";
import AISettings from "./AISettings.tsx";
import GenerateButton from "./subs/GenerateButton.tsx";


export default function DrawConfigs({form, height, onClickGenerate, cardRef, onResolutionSetChange, resolutionSelectValue,
                                        usePresetResolution, generating, cost, onClickRefreshCost, refreshingCost, plusH,
                                         startGenerate}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>, height: number, onClickGenerate: (v: BasePrompts) => any,
    cardRef: React.MutableRefObject<HTMLDivElement | null>, onResolutionSetChange: (v: string | null) => any,
    resolutionSelectValue: string | null, usePresetResolution: boolean, generating: boolean, cost: number, onClickRefreshCost: () => Promise<number>,
    refreshingCost: boolean, plusH: number, startGenerate: (reqData: {[p: string]: any}) => any
}) {
    const isRefreshingRef = useRef<boolean>(false)
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const refreshCost = () => {
        if (!isRefreshingRef.current) {
            isRefreshingRef.current = true;
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            refreshTimeoutRef.current = setTimeout(async () => {
                await onClickRefreshCost();
                isRefreshingRef.current = false;
            }, 1000);
        }
        else {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            refreshTimeoutRef.current = setTimeout(async () => {
                await onClickRefreshCost();
                isRefreshingRef.current = false;
            }, 1000);
        }
    };

    return (
        <form onSubmit={form.onSubmit((values) => onClickGenerate(values))}>
            <Flex gap="md" justify="center" align="center" direction="column" wrap="wrap">
                <Card radius="false" shadow="false" withBorder maw={450} ref={cardRef}
                      style={{overflow: "auto", ...noMargin}}>
                    <ScrollArea.Autosize mah={height - 100 - plusH}>
                        <ModelSelect form={form} refreshCost={refreshCost}/>

                        <PromptSelect form={form}/>

                        <Img2Img form={form} setSelectValue={onResolutionSetChange} refreshCost={refreshCost}
                                 generating={generating} startGenerate={startGenerate}/>

                        <ResolutionSettings form={form} onResolutionSetChange={onResolutionSetChange}
                                            resolutionSelectValue={resolutionSelectValue}
                                            usePresetResolution={usePresetResolution} refreshCost={refreshCost}/>

                        <AISettings form={form} refreshCost={refreshCost}/>
                    </ScrollArea.Autosize>
                    <Group justify="center" style={{marginTop: "1em"}}>
                        <GenerateButton generating={generating} onClickGenerate={onClickGenerate} form={form} hide={false}
                                        cost={cost} onClickRefreshCost={onClickRefreshCost} refreshingCost={refreshingCost}
                                        btnStyle={plusH == 0 ? {marginLeft: "1em", marginRight: "1em"} : undefined} fullWidth={true} />
                    </Group>
                </Card>



            </Flex>
        </form>
    )
}
