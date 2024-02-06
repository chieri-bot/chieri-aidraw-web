import {Group, NumberInput, Select} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {UseFormReturnType} from "@mantine/form";
import {marginTopBottom, maxWidth} from "../styles.ts";
import {modelResolutionPresets} from "../utils/presets.ts";


export default function ResolutionSettings({form, resolutionSelectValue, usePresetResolution, onResolutionSetChange, refreshCost}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>,
    usePresetResolution: boolean,
    resolutionSelectValue: string | null,
    onResolutionSetChange:  (v: string | null) => any, refreshCost: () => any
}) {


    return (
        <Group style={{...marginTopBottom, ...maxWidth}}>
            <Select
                value={resolutionSelectValue}
                style={maxWidth}
                clearable
                label="分辨率设置"
                placeholder="自由设置"
                defaultValue="NP"
                data={modelResolutionPresets}
                {...form.getInputProps('otherSets.resolutionSelect')}
                onChange={(v) => {
                    onResolutionSetChange(v)
                    refreshCost()
                }}
            />
            <Group justify="space-between" style={{overflow: "hidden", ...maxWidth}} grow>
                <NumberInput min={64} max={4915} allowNegative={false} allowDecimal={false} step={64} disabled={usePresetResolution}
                             miw={70} label="宽"
                             onBlur={() => {
                                 const resetValue = Math.round(form.values.parameters.width / 64) * 64
                                 form.setFieldValue("parameters.width", resetValue)
                             }}
                             value={form.values.parameters.width}
                             onChange={(v) => {
                                 form.setFieldValue("parameters.width", v)
                                 refreshCost()
                             }}/>
                <NumberInput min={64} max={4915} allowNegative={false} allowDecimal={false} step={64} disabled={usePresetResolution}
                             miw={70} label="高"
                             onBlur={() => {
                                 const resetValue = Math.round(form.values.parameters.height / 64) * 64
                                 form.setFieldValue("parameters.height", resetValue)
                             }}
                             value={form.values.parameters.height}
                             onChange={(v) => {
                                 form.setFieldValue("parameters.height", v)
                                 refreshCost()
                             }}/>
            </Group>

        </Group>
    )
}
