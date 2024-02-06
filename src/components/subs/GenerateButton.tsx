import React, {CSSProperties} from "react";
import {Button, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {BasePrompts} from "../../utils/models.ts";


export default function GenerateButton({generating, onClickGenerate, form, hide, cost, onClickRefreshCost, refreshingCost, btnStyle}: {generating?: boolean,
    onClickGenerate: (v: BasePrompts) => any, form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>,
    hide: boolean, cost: number, onClickRefreshCost: () => any, refreshingCost: boolean, btnStyle?: CSSProperties}) {

    return (
        <Button disabled={generating} loading={generating} fullWidth display={hide ? "none" : "unset"}
                onClick={() => onClickGenerate(form.values)} justify="space-between" style={btnStyle}
                rightSection={
                    <Tooltip label="点击刷新消耗">
                        <Button variant="outline" color="white" size="xs" loaderProps={{ type: 'dots' }} loading={refreshingCost}
                                onClick={(e) => {
                                    onClickRefreshCost()
                                    e.stopPropagation()
                                }}>
                            消耗: {cost}
                        </Button>
                    </Tooltip>
                } >生成</Button>
    )
}
