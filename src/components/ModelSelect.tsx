import {Select} from "@mantine/core";
import {BasePrompts} from "../utils/models.ts";
import {UseFormReturnType} from "@mantine/form";
import {modelDefaultSettings, modelVer} from "../utils/presets.ts";


export default function ModelSelect({form, refreshCost}: {form: UseFormReturnType<BasePrompts, (values: BasePrompts) => BasePrompts>,
    refreshCost: () => any}) {
    return (
        <Select
            label=""
            placeholder="选择模型"
            defaultValue="nai-diffusion-3"
            data={[
                { group: 'NEW', items: [{label: "NAI Diffusion Anime V3", value: "nai-diffusion-3"}] },
                { group: 'LEGACY', items: [
                        {label: "NAI Diffusion Anime V2", value: "nai-diffusion-2"},
                        {label: "NAI Diffusion Furry (Beta V1.3)", value: "nai-diffusion-furry"},
                        {label: "NAI Diffusion Anime V1 (Full)", value: "nai-diffusion"},
                        {label: "NAI Diffusion Anime V1 (Curated)", value: "safe-diffusion"},
                    ] },
            ]}
            {...form.getInputProps('model')}
            onChange={(value) => {
                if (value) {
                    form.setValues({model: value})
                    form.setFieldValue("parameters.scale", modelDefaultSettings[modelVer[value]].defaultScale)
                    form.setFieldValue("parameters.sampler", modelDefaultSettings[modelVer[value]].sampler)
                    refreshCost()
                }
                else {
                    form.setValues({model: form.values.model})
                }
            }}
        />
    )
}
