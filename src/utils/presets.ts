import {BasePrompts} from "./models.ts";

interface IModelResolutionPresets {
    group: string,
    items: { label: string, value: string }[]
}

export const mWHValues: { [key: string]: number[] } = {
    "NP": [832, 1216],
    "NL": [1216, 832],
    "NS": [1024, 1024],
    "LP": [1024, 1536],
    "LL": [1536, 1024],
    "LS": [1472, 1472],
    "WP": [1088, 1920],
    "WL": [1920, 1088],
    "SP": [512, 768],
    "SL": [768, 512],
    "SS": [640, 640],
}

export const modelResolutionPresets: IModelResolutionPresets[] = [
    {
        group: "普通尺寸",
        items: [
            {label: `普通尺寸 竖向 (${mWHValues.NP[0]}, ${mWHValues.NP[1]})`, value: "NP"},
            {label: `普通尺寸 横向 (${mWHValues.NL[0]}, ${mWHValues.NL[1]})`, value: "NL"},
            {label: `普通尺寸 正方形 (${mWHValues.NS[0]}, ${mWHValues.NS[1]})`, value: "NS"},
        ]
    },
    {
        group: "大尺寸",
        items: [
            {label: `大尺寸 竖向 (${mWHValues.LP[0]}, ${mWHValues.LP[1]})`, value: "LP"},
            {label: `大尺寸 横向 (${mWHValues.LL[0]}, ${mWHValues.LL[1]})`, value: "LL"},
            {label: `大尺寸 正方形 (${mWHValues.LS[0]}, ${mWHValues.LS[1]})`, value: "LS"},
        ]
    },
    {
        group: "壁纸",
        items: [
            {label: `壁纸 竖向 (${mWHValues.WP[0]}, ${mWHValues.WP[1]})`, value: "WP"},
            {label: `壁纸 横向 (${mWHValues.WL[0]}, ${mWHValues.WL[1]})`, value: "WL"},
        ]
    },
    {
        group: "小尺寸",
        items: [
            {label: `小尺寸 竖向 (${mWHValues.SP[0]}, ${mWHValues.SP[1]})`, value: "SP"},
            {label: `小尺寸 横向 (${mWHValues.SL[0]}, ${mWHValues.SL[1]})`, value: "SL"},
            {label: `小尺寸 正方形 (${mWHValues.SS[0]}, ${mWHValues.SS[1]})`, value: "SS"},
        ]
    },
]

interface IModelDefaultSettingsItem {
    defaultScale: number,
    maxScale: number,
    sampler: string,
    has_uncond_scale: boolean,
    has_cfg_rescale: boolean,
    has_noise_schedule: boolean
}

export const modelDefaultSettings: { [key: number]: IModelDefaultSettingsItem } = {
    1: {
        defaultScale: 10,
        maxScale: 25,
        sampler: "k_euler_ancestral",
        has_uncond_scale: false,
        has_cfg_rescale: false,
        has_noise_schedule: false
    },
    2: {
        defaultScale: 10,
        maxScale: 25,
        sampler: "k_euler_ancestral",
        has_uncond_scale: true,
        has_cfg_rescale: false,
        has_noise_schedule: false
    },
    3: {
        defaultScale: 5,
        maxScale: 10,
        sampler: "k_euler",
        has_uncond_scale: true,
        has_cfg_rescale: true,
        has_noise_schedule: true
    },
}

export const modelVer: { [key: string]: number } = {
    "safe-diffusion": 1,
    "nai-diffusion": 1,
    "nai-diffusion-furry": 1,
    "nai-diffusion-2": 2,
    "nai-diffusion-3": 3
}

interface IUCPresetType {
    ucPreset: number,
    negative_prompt: string[]
}

export const ucPresetTypes: { [key: string]: IUCPresetType } = {
    "heavy": {
        ucPreset: 0,
        negative_prompt: ['nsfw', 'lowres', '{bad}', 'error', 'fewer', 'extra', 'missing', 'worst quality',
            'jpeg artifacts', 'bad quality', 'watermark', 'unfinished', 'displeasing', 'chromatic aberration',
            'signature', 'extra digits', 'artistic error', 'username', 'scan', '[abstract]']
    },
    "light": {
        ucPreset: 1,
        negative_prompt: ['nsfw', 'lowres', 'jpeg artifacts', 'worst quality', 'watermark', 'blurry', 'very displeasing']
    },
    "humanFocus": {
        ucPreset: 2,
        negative_prompt: ['nsfw', 'lowres', '{bad}', 'error', 'fewer', 'extra', 'missing', 'worst quality', 'jpeg artifacts',
            'bad quality', 'watermark', 'unfinished', 'displeasing', 'chromatic aberration', 'signature', 'extra digits',
            'artistic error', 'username', 'scan', '[abstract]', "bad anatomy", "bad hands", "@_@", "mismatched pupils",
            "heart-shaped pupils", "glowing eyes"
        ]
    },
    "none": {
        ucPreset: 3,
        negative_prompt: ['lowres']
    },
}

export const getDefaultFormInit = (): BasePrompts => {
    return {
        prompt: [],
        model: "nai-diffusion-3",
        action: "generate",
        eco_chieri: true,
        parameters: {
            width: 832,
            height: 1216,
            steps: 28,
            scale: 5,
            seed: "",  // 输入清空为空字符串
            ucPreset: 0,
            sampler: "k_euler",
            sm: false,
            sm_dyn: false,  // sm 为 false 时，此项也为 false
            dynamic_thresholding: false,
            negative_prompt: ['nsfw', 'lowres', '{bad}', 'error', 'fewer', 'extra', 'missing', 'worst quality',
                'jpeg artifacts', 'bad quality', 'watermark', 'unfinished', 'displeasing', 'chromatic aberration',
                'signature', 'extra digits', 'artistic error', 'username', 'scan', '[abstract]'],
        },
        img2imgPara: {
            image: "",
            strength: 0.7,
            noise: 0,
            // extra_noise_seed: number
        },
        advanced: {
            "uncond_scale": 1,
            "cfg_rescale": 0,
            "noise_schedule": "native",
        },
        otherSets: {
            addQualityTags: true,
            ucPresetType: "heavy",
            resolutionSelect: "NP"
        }
    }
}
