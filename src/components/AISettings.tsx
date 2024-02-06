import React from "react";
import {
    Box, Button, Card,
    Checkbox, CloseButton, Collapse,
    Flex,
    Group,
    NumberInput,
    Select,
    Slider,
    Text,
    Tooltip
} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {UseFormReturnType} from "@mantine/form";
import {marginTopBottom, maxWidth} from "../styles.ts";
import {modelDefaultSettings, modelVer} from "../utils/presets.ts";
import {useDisclosure} from "@mantine/hooks";
import Icon from "@mdi/react";
import {mdiMenuDown, mdiMenuUp} from "@mdi/js";


export default function AISettings({form, refreshCost}: {
    form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>, refreshCost: () => any
}) {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{...maxWidth, ...marginTopBottom}}>
            <Group justify="space-between" mb={5}>
                <Button onClick={toggle}>
                    高级设置<Icon path={opened ? mdiMenuUp : mdiMenuDown} size={1}/>
                </Button>
                <Flex gap="xs" justify="flex-end" align="center" direction="row">
                    <Text size="sm">Steps<Text fw={500} size="sm">{form.values.parameters.steps}</Text></Text>
                    <Text size="sm">Guidance<Text fw={500} size="sm">{form.values.parameters.scale}</Text></Text>
                    <Text size="sm">Seed<Text fw={500} size="sm">{form.values.parameters.seed === "" ? "N/A" : form.values.parameters.seed}</Text></Text>
                </Flex>
            </Group>

            <Collapse in={opened}>
                <Text>Steps: <Text span fw={500}>{form.values.parameters.steps}</Text></Text>
                <Slider
                    style={maxWidth}
                    defaultValue={28}
                    min={1}
                    max={50}
                    label={(value) => value.toFixed(0)}
                    step={1}
                    {...form.getInputProps('parameters.steps')}
                    onChange={(v) => {
                        form.getInputProps('parameters.steps').onChange(v)
                        refreshCost()
                    }}
                />

                <Group justify="space-between" style={maxWidth}>
                    <Text>Prompt Guidance: <Text span fw={500}>{form.values.parameters.scale}</Text></Text>
                    <Tooltip label="Reduce artifacts caused by high prompt guidance values.">
                        <Checkbox label="Decrisper"
                                  {...form.getInputProps('parameters.dynamic_thresholding')}
                                  onChange={(v) => {
                                      form.getInputProps('parameters.dynamic_thresholding').onChange(v)
                                      refreshCost()
                                  }}
                        />
                    </Tooltip>
                </Group>
                <Slider
                    style={maxWidth}
                    defaultValue={modelDefaultSettings[modelVer[form.values.model]].defaultScale}
                    min={1}
                    max={modelDefaultSettings[modelVer[form.values.model]].maxScale}
                    label={(value) => value.toFixed(1)}
                    step={0.1}
                    {...form.getInputProps('parameters.scale')}
                    onChange={(v) => {
                        form.getInputProps('parameters.scale').onChange(v)
                        refreshCost()
                    }}
                />

                <Group justify="space-between" style={{...maxWidth}} grow align="start">
                    <NumberInput min={0} max={9999999999} allowNegative={false} allowDecimal={false} maxLength={10}
                                 label="Seed"
                                 hideControls
                                 placeholder="自定义种子，留空为随机。"
                                 rightSection={
                                     <CloseButton
                                         aria-label="Clear input"
                                         onClick={() => form.setFieldValue('parameters.seed', '')}
                                         style={{ display: form.values.parameters.seed === '' ? 'none' : undefined }}
                                     />
                                 }
                                 {...form.getInputProps('parameters.seed')}
                                 onBlur={(v) => {
                                     form.getInputProps('parameters.seed').onBlur(v)
                                     refreshCost()
                                 }}
                    />

                    <Group>
                        <Select
                            label="Sampler"
                            placeholder="采样器选择"
                            defaultValue="k_euler"
                            data={[
                                {
                                    group: 'RECOMMENDED', items: [
                                        {label: "Euler", value: "k_euler"},
                                        {label: "Euler Ancestral", value: "k_euler_ancestral"},
                                        {label: "DPM++ 2S Ancestral", value: "k_dpmpp_2s_ancestral"},
                                    ]
                                },
                                {
                                    group: 'OTHER', items: [
                                        {label: "DPM++ 2M", value: "k_dpmpp_2m"},
                                        {label: "DPM++ SDE", value: "k_dpmpp_sde"},
                                        {label: "DDIM", value: "ddim_v3"},
                                    ]
                                },
                            ]}
                            {...form.getInputProps('parameters.sampler')}
                            onChange={(v) => {
                                if (!v) {
                                    v = form.values.parameters.sampler
                                }
                                form.getInputProps('parameters.sampler').onChange(v)
                                refreshCost()
                            }}
                        />
                        <Tooltip label="Smea versions of samplers are modified to perform better at high resolutions.">
                            <Checkbox label="SMEA" defaultChecked={form.values.parameters.sm}
                                      {...form.getInputProps('parameters.sm')}
                                      onChange={(v) => {
                                          form.getInputProps('parameters.sm').onChange(v)
                                          refreshCost()
                                      }}
                            />
                        </Tooltip>
                        <Tooltip label="Dyn variants of smea samplers often lead tomore varied output, but may fail at very high resolutions.">
                            <Checkbox label="DYN" defaultChecked={form.values.parameters.sm_dyn}
                                      {...form.getInputProps('parameters.sm_dyn')}
                                      onChange={(v) => {
                                          form.getInputProps('parameters.sm_dyn').onChange(v)
                                          refreshCost()
                                      }}
                                      display={form.values.parameters.sm ? "unset": "none"}/>
                        </Tooltip>
                    </Group>
                </Group>

                <Box style={{...maxWidth, ...marginTopBottom}}>
                    {modelDefaultSettings[modelVer[form.values.model]].has_uncond_scale && <Group gap="0">
                        <Text>Undesired Content Strength: <Text span fw={500}>{(form.values.advanced.uncond_scale * 100).toFixed(0)}%</Text></Text>
                        <Slider
                            style={maxWidth}
                            defaultValue={1}
                            min={0}
                            max={1.5}
                            label={(value) => value.toFixed(2)}
                            step={0.01}
                            {...form.getInputProps('advanced.uncond_scale')}
                            onChange={(v) => {
                                form.getInputProps('advanced.uncond_scale').onChange(v)
                                refreshCost()
                            }}
                        />
                    </Group>}

                    {modelDefaultSettings[modelVer[form.values.model]].has_cfg_rescale && <Group gap="0">
                        <Text>Prompt Guidance Rescale: <Text span fw={500}>{form.values.advanced.cfg_rescale.toFixed(2)}</Text></Text>
                        <Slider
                            style={maxWidth}
                            defaultValue={1}
                            min={0}
                            max={1}
                            label={(value) => value.toFixed(2)}
                            step={0.02}
                            {...form.getInputProps('advanced.cfg_rescale')}
                            onChange={(v) => {
                                form.getInputProps('advanced.cfg_rescale').onChange(v)
                                refreshCost()
                            }}
                        />
                    </Group>}

                    {modelDefaultSettings[modelVer[form.values.model]].has_noise_schedule && <Group gap="0">
                        <Select
                            style={maxWidth}
                            label="Noise Schedule"
                            placeholder="Noise Schedule Select"
                            defaultValue="native"
                            data={[
                                {label: "native (recommended)", value: "native"},
                                {label: "karras", value: "karras"},
                                {label: "exponential", value: "exponential"},
                                {label: "polyexponential", value: "polyexponential"},
                            ]}
                            {...form.getInputProps('advanced.noise_schedule')}
                            onChange={(v) => {
                                if (!v) {
                                    v = form.values.advanced.noise_schedule
                                }
                                form.getInputProps('advanced.noise_schedule').onChange(v)
                                refreshCost()
                            }}
                        />
                    </Group>}
                </Box>

            </Collapse>
        </Card>

    )
}
