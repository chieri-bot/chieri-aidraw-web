import {BasePrompts} from "./models.ts";
import {modelDefaultSettings, modelVer} from "./presets.ts";
import {getRandomInt} from "./utils.ts";

/*
function reqParseV3(values: BasePrompts) {
    // const defaultSettings = modelDefaultSettings[3]
    const seed = typeof values.parameters.seed === "string" ? getRandomInt(0, 9999999999) : values.parameters.seed

    const ret: {[key: string]: any} = {
        "input": `${values.prompt.join(", ")}, , best quality, amazing quality, very aesthetic, absurdres`,
        "model": values.model,
        "action": values.action,
        "parameters": {
            "params_version": 1,
            "width": values.parameters.width,
            "height": values.parameters.height,
            "scale": values.parameters.scale,
            "sampler": values.parameters.sampler,
            "steps": values.parameters.steps,
            "n_samples": 1,
            "ucPreset": 0,
            "qualityToggle": true,
            "sm": values.parameters.sm,
            "sm_dyn": values.parameters.sm ? values.parameters.sm_dyn : false,
            "dynamic_thresholding": values.parameters.dynamic_thresholding,
            "controlnet_strength": 1,
            "legacy": false,
            "add_original_image": true,
            "uncond_scale": values.advanced.uncond_scale,
            "cfg_rescale": values.advanced.cfg_rescale,
            "noise_schedule": values.advanced.noise_schedule,
            "legacy_v3_extend": false,
            "seed": seed,
            "negative_prompt": values.parameters.negative_prompt.join(", ")
        }
    }
    if (values.img2imgPara.image != "") {
        ret.action = "img2img"
        ret.parameters["image"] = values.img2imgPara.image
        ret.parameters["strength"] = values.img2imgPara.strength
        ret.parameters["noise"] = values.img2imgPara.noise
        ret.parameters["extra_noise_seed"] = seed
    }
    return ret
}

function reqParseV2(values: BasePrompts) {
    // const defaultSettings = modelDefaultSettings[3]
    const seed = typeof values.parameters.seed === "string" ? getRandomInt(0, 9999999999) : values.parameters.seed

    const ret: {[key: string]: any} = {
        "input": `${values.prompt.join(", ")}, , best quality, amazing quality, very aesthetic, absurdres`,
        "model": values.model,
        "action": values.action,
        "parameters": {
            "params_version": 1,
            "width": values.parameters.width,
            "height": values.parameters.height,
            "scale": values.parameters.scale,
            "sampler": values.parameters.sampler,
            "steps": values.parameters.steps,
            "seed": seed,
            "n_samples": 1,
            "ucPreset": 0,
            "qualityToggle": true,
            "sm": values.parameters.sm,
            "sm_dyn": values.parameters.sm ? values.parameters.sm_dyn : false,
            "dynamic_thresholding": values.parameters.dynamic_thresholding,
            "controlnet_strength": 1,
            "legacy": false,
            "add_original_image": true,
            "uncond_scale": values.advanced.uncond_scale,
            "legacy_v3_extend": false,
            "negative_prompt": values.parameters.negative_prompt.join(", ")
        }
    }
    if (values.img2imgPara.image != "") {
        ret.action = "img2img"
        ret.parameters["image"] = values.img2imgPara.image
        ret.parameters["strength"] = values.img2imgPara.strength
        ret.parameters["noise"] = values.img2imgPara.noise
        ret.parameters["extra_noise_seed"] = seed
    }
    return ret
}

function reqParseV1(values: BasePrompts) {
    // const defaultSettings = modelDefaultSettings[3]
    const seed = typeof values.parameters.seed === "string" ? getRandomInt(0, 9999999999) : values.parameters.seed

    const ret: {[key: string]: any} = {
        "input": `${values.prompt.join(", ")}, , best quality, amazing quality, very aesthetic, absurdres`,
        "model": values.model,
        "action": values.action,
        "parameters": {
            "params_version": 1,
            "width": values.parameters.width,
            "height": values.parameters.height,
            "scale": values.parameters.scale,
            "sampler": values.parameters.sampler,
            "steps": values.parameters.steps,
            "seed": seed,
            "n_samples": 1,
            "ucPreset": 0,
            "qualityToggle": true,
            "sm": values.parameters.sm,
            "sm_dyn": values.parameters.sm ? values.parameters.sm_dyn : false,
            "dynamic_thresholding": values.parameters.dynamic_thresholding,
            "controlnet_strength": 1,
            "legacy": false,
            "add_original_image": true,
            // "uncond_scale": values.advanced.uncond_scale,
            "legacy_v3_extend": false,
            "negative_prompt": values.parameters.negative_prompt.join(", ")
        }
    }
    if (values.img2imgPara.image != "") {
        ret.action = "img2img"
        ret.parameters["image"] = values.img2imgPara.image
        ret.parameters["strength"] = values.img2imgPara.strength
        ret.parameters["noise"] = values.img2imgPara.noise
        ret.parameters["extra_noise_seed"] = seed
    }
    return ret
}

*/

export function getDrawRequestBody(values: BasePrompts) {
    const version = modelVer[values.model]
    const defaultSettings = modelDefaultSettings[version]
    const seed = typeof values.parameters.seed === "string" ? getRandomInt(0, 9999999999) : values.parameters.seed

    const ret: {[key: string]: any} = {
        "input": `${values.prompt.join(", ")}${values.otherSets.addQualityTags ? ", , best quality, amazing quality, very aesthetic, absurdres" : ""}`,
        "model": values.model,
        "action": values.action,
        "parameters": {
            "params_version": 1,
            "width": values.parameters.width,
            "height": values.parameters.height,
            "scale": values.parameters.scale,
            "sampler": values.parameters.sampler,
            "steps": values.parameters.steps,
            "n_samples": 1,
            "ucPreset": values.parameters.ucPreset,
            "qualityToggle": values.otherSets.addQualityTags,
            "sm": values.parameters.sm,
            "sm_dyn": values.parameters.sm ? values.parameters.sm_dyn : false,
            "dynamic_thresholding": values.parameters.dynamic_thresholding,
            "controlnet_strength": 1,
            "legacy": false,
            "add_original_image": true,
            // "uncond_scale": values.advanced.uncond_scale,
            // "cfg_rescale": values.advanced.cfg_rescale,
            // "noise_schedule": values.advanced.noise_schedule,
            "legacy_v3_extend": false,
            "seed": seed,
            "negative_prompt": values.parameters.negative_prompt.join(", ")
        }
    }
    if (values.img2imgPara.image != "") {
        ret.action = "img2img"
        ret.parameters["image"] = values.img2imgPara.image
        ret.parameters["strength"] = values.img2imgPara.strength
        ret.parameters["noise"] = values.img2imgPara.noise
        ret.parameters["extra_noise_seed"] = seed
    }

    if (defaultSettings.has_uncond_scale) ret.parameters["uncond_scale"] = values.advanced.uncond_scale
    if (defaultSettings.has_cfg_rescale) ret.parameters["cfg_rescale"] = values.advanced.cfg_rescale
    if (defaultSettings.has_noise_schedule) ret.parameters["noise_schedule"] = values.advanced.noise_schedule

    return ret
}