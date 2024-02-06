import React, {useState} from "react";
import {Box, Checkbox, Flex, SegmentedControl, Select, TagsInput, Tooltip} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {UseFormReturnType} from "@mantine/form";
import {marginTopBottom, maxWidth} from "../styles.ts";
import {ucPresetTypes} from "../utils/presets.ts";


export default function PromptSelect({form}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>
}) {
    const [promptDisplay, setPromptDisplay] = useState('prompt')

    const updateUCPresetByType = (v: string) => {
        const value = ucPresetTypes[v]
        form.values.parameters.ucPreset = value.ucPreset
        form.values.parameters.negative_prompt = value.negative_prompt
    }

    return (
        <Flex justify="flex-start" align="flex-start" direction="column" wrap="wrap" style={marginTopBottom}>
            <SegmentedControl
                style={maxWidth}
                value={promptDisplay}
                onChange={setPromptDisplay}
                data={[
                    { label: 'Prompt', value: 'prompt' },
                    { label: 'Negative Prompt', value: 'negative_prompt' }
                ]}
            />
            <Box style={maxWidth} display={promptDisplay == "prompt" ? "unset": "none"}>
                <TagsInput
                    style={maxWidth}
                    clearable
                    allowDuplicates
                    splitChars={[',', '，']}
                    label=""
                    placeholder="输入你的 Prompt"
                    {...form.getInputProps('prompt')}
                />
                <Tooltip label="会在尾部自动添加以下 Tag: best quality, amazing quality, very aesthetic, absurdres">
                    <Checkbox label="添加画质提升 Tags" style={{marginTop: "3px"}} defaultChecked={form.values.otherSets.addQualityTags}
                              {...form.getInputProps('otherSets.addQualityTags')}/>
                </Tooltip>
            </Box>
            <Box style={maxWidth} display={promptDisplay == "negative_prompt" ? "unset": "none"}>
                <Select
                    label="排除内容预设"
                    placeholder="排除内容预设"
                    defaultValue="heavy"
                    data={[
                        {label: "Heavy", value: "heavy"},
                        {label: "Light", value: "light"},
                        {label: "Human Focus", value: "humanFocus"},
                        {label: "None", value: "none"},
                    ]}
                    {...form.getInputProps('otherSets.ucPresetType')}
                    onChange={(v) => {
                        if (!v) v = form.values.otherSets.ucPresetType
                        form.setFieldValue("otherSets.ucPresetType", v)
                        updateUCPresetByType(v)
                    }}
                />
                <TagsInput style={maxWidth}
                           clearable
                           allowDuplicates
                           splitChars={[',', '，']}
                           label=""
                           placeholder="输入不想要的 Prompt"
                           {...form.getInputProps('parameters.negative_prompt')}
                />
            </Box>
        </Flex>
    )
}
