import {
    ActionIcon,
    Burger, Button,
    Group,
    Menu, PasswordInput,
    rem,
    Text, TextInput, Tooltip,
    useComputedColorScheme,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import {UserData} from "../utils/models.ts";
import Icon from "@mdi/react";
import {
    mdiAccount,
    mdiExitToApp, mdiGithub, mdiLockReset,
    mdiPlusBoxOutline,
    mdiRefresh, mdiSwapHorizontal,
    mdiThemeLightDark,
    mdiWeatherNight, mdiWeatherSunny
} from "@mdi/js";
import React, {useEffect, useRef, useState} from "react";
import {jumpToLink, showErrorMessage, showInfoMessage, timestampToDateString} from "../utils/utils.ts";
import {apiBindQQ, apiChangeEmail, apiChangePassword, apiLogout} from "../utils/api.ts";
import {PageType} from "../utils/enums.ts";
import {useToggle} from "@mantine/hooks";
import {modals} from '@mantine/modals';
import {useForm} from "@mantine/form";
import {confirmCheck} from "./subs/confirms.tsx";
import copy from 'clipboard-copy';


interface PasswordChangeType {
    password: string,
    password2: string
}

interface EmailChangeType {
    email: string
}

export function ThemeToggle() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [colorSchemeState, toggleColorSchemeState] = useToggle(['auto', 'dark', 'light'] as const);
    const computedColorScheme = useComputedColorScheme('light');
    const theme = useMantineTheme();

    useEffect(() => {
        toggleColorSchemeState(colorScheme);
    }, []);

    useEffect(() => {
        setColorScheme(colorSchemeState);
    }, [colorSchemeState]);

    return (
        <Group justify="center">
            <Tooltip label={colorSchemeState === 'auto' ? '跟随系统' : colorSchemeState === 'dark' ? '深色模式' : '浅色模式'} position="left">
                <ActionIcon variant="light" size="md" onClick={() => toggleColorSchemeState()} color={
                    colorSchemeState === 'auto' ? undefined : computedColorScheme === 'dark' ? theme.colors.blue[4] : theme.colors.yellow[6]
                }>
                    <Icon path={colorSchemeState === 'auto' ? mdiThemeLightDark : colorSchemeState === 'dark' ? mdiWeatherNight : mdiWeatherSunny}
                          style={{ width: rem(18), height: rem(18) }}/>
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}

export function PasswordChange({setChangingPasswd, pageTypeSet, changingPasswd}: {setChangingPasswd: (v: boolean) => any, pageTypeSet: (pageType: PageType) => void,
    changingPasswd: boolean}) {
    const passwordChangeForm = useForm<PasswordChangeType>({
        initialValues: {
            password: '',
            password2: '',
        },
        validate: {
            password: (value, others) => (others.password2 === value ? null : "两次输入密码不一致"),
            password2: (value, others) => (others.password === value ? null : "两次输入密码不一致")
        }
    });

    return (
        <form onSubmit={passwordChangeForm.onSubmit((values) => {
            setChangingPasswd(true)
            apiChangePassword(values.password)
                .then((result) => {
                    if (result.success) {
                        showInfoMessage("", "密码修改成功", 6000)
                        modals.closeAll()
                        pageTypeSet(PageType.Login)
                    } else {
                        showErrorMessage(result.msg, "密码修改失败")
                    }
                })
                .catch((e) => showInfoMessage(e.toString(), "密码修改出错"))
                .finally(() => setChangingPasswd(false))
        })}>
            <PasswordInput label="新密码" placeholder="新密码" {...passwordChangeForm.getInputProps('password')}/>
            <PasswordInput label="确认新密码"
                           placeholder="确认新密码" {...passwordChangeForm.getInputProps('password2')}/>
            <Button fullWidth mt="md" loading={changingPasswd} type="submit">
                修改
            </Button>
        </form>
    )
}

export function EmailChange({setChangingEmail, changingEmail, refreshUserData}: {setChangingEmail: (v: boolean) => any, changingEmail: boolean, refreshUserData: () => any}) {
    const passwordChangeForm = useForm<EmailChangeType>({
        initialValues: {
            email: ""
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "不合法的邮箱"),
        }
    });

    return (
        <form onSubmit={passwordChangeForm.onSubmit((values) => {
            setChangingEmail(true)
            apiChangeEmail(values.email)
                .then((result) => {
                    if (result.success) {
                        showInfoMessage("", "邮箱修改成功", 6000)
                        modals.closeAll()
                        refreshUserData()
                    } else {
                        showErrorMessage(result.msg, "邮箱修改失败")
                    }
                })
                .catch((e) => showInfoMessage(e.toString(), "邮箱修改出错"))
                .finally(() => setChangingEmail(false))
        })}>
            <TextInput label="新邮箱" placeholder="xxx@xxx.com" {...passwordChangeForm.getInputProps('email')}/>
            <Button fullWidth mt="md" loading={changingEmail} type="submit">
                修改
            </Button>
        </form>
    )
}

export default function UserInfoHead({userData, refreshUserData, pageTypeSet, drawerOpened, open, burgerDisplay}: {
    userData: UserData,
    refreshUserData: () => any,
    pageTypeSet: (pageType: PageType) => void,
    drawerOpened: boolean,
    open: () => void,
    burgerDisplay: boolean
}) {
    // const [width, setWidth] = useState(window.innerWidth)
    // const [height, setHeight] = useState(window.innerHeight)
    const [changingPasswd, setChangingPasswd] = useState(false)
    const [changingEmail, setChangingEmail] = useState(false)
    const mainGroupRef = useRef<HTMLDivElement | null>(null)
    const userNameTextWidthCache = useRef(300)
    const userNameTextRef = useRef<HTMLParagraphElement | null>(null)
    const [displayUserName, setDisplayUserName] = useState(true)

    const handleResize = () => {
        // setWidth(window.innerWidth);
        // setHeight(window.innerHeight);
        if (mainGroupRef.current) {
            let userNameW: number
            if (userNameTextRef.current) {
                userNameW = userNameTextRef.current.offsetWidth
                userNameTextWidthCache.current = userNameW
            }
            else {
                userNameW = userNameTextWidthCache.current
            }
            const groupW = mainGroupRef.current.offsetWidth
            setDisplayUserName(userNameW / groupW <= 0.15)
        }
    };

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);



    const getMonthlyTimeStr = (timeS: number) => {
        const date = new Date()
        const timeNow = date.getTime() / 1000
        if (timeNow > timeS) {
            return "未开通"
        }
        return timestampToDateString(timeS * 1000)
    }

    const logout = () => {
        apiLogout()
            .then(() => {
                localStorage.removeItem("token")
                pageTypeSet(PageType.Login)
            })
            .catch((e) => showErrorMessage(e.toString(), "Error"))
    }

    const changeBindQQConfirm = () => {
        confirmCheck("绑定QQ", (userData.bind_qq ? "您已绑定QQ，要换绑吗？" : "确定要绑定QQ吗?"), () => {
            apiBindQQ()
                .then((result) => {
                    if (result.success) {
                        confirmCheck("请求成功", `您的绑定代码是: ${result.msg}`, () => {
                                copy(`/aiaccount bind ${result.msg}`)
                                    .then(() => showInfoMessage("", "复制成功", 3000))
                                    .catch((reason) => showErrorMessage(reason.toString(), "复制指令失败"))
                        }, `请前往任意部署了分布式 Chieri Bot 的群内，输入: /aiaccount bind ${result.msg} 即可绑定。`,
                            {confirm: "复制指令", cancel: "关闭"})
                    }
                    else {
                        showErrorMessage(result.msg, "绑定失败")
                    }
                })
                .catch((e) => showErrorMessage(e.toString(), "绑定出错"))
        }, "绑定QQ后，您将使用对应QQ号的点数。若本账号有剩余的点数，将合并到QQ中。QQ号点数在网页端和群内 Bot 通用。")
    }

    const notBindQQBuyConfirm = (url: string) => {
        if (userData.bind_qq) {
            return jumpToLink("https://afdian.net/a/chieri?tab=shop")
        }
        confirmCheck("您还没有绑定QQ", "购买点数时，请在填写QQ的部分，填写您的用户名:", () => {
            modals.closeAll()
            jumpToLink(url)
        }, `${userData.user_name}`)

    }


    return (
        <Group justify="space-between" ref={mainGroupRef}>
            <Burger opened={drawerOpened} onClick={open} display={burgerDisplay ? "unset" : "none"} size="sm"/>
            <Text fw={500}>
                {displayUserName && <Text span fw={500} ref={userNameTextRef}>{userData.user_name}</Text>}
                <Text span>&emsp;点数: </Text>
                <Text span fw={500}>{userData.left_point}</Text>
            </Text>

            <Group>
                <ThemeToggle/>

                <Tooltip label="Github" position="left">
                    <ActionIcon variant="light" size="md" onClick={() => jumpToLink("https://github.com/chieri-bot/chieri-aidraw-web")} >
                        <Icon path={mdiGithub} style={{ width: rem(18), height: rem(18) }}/>
                    </ActionIcon>
                </Tooltip>

                <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                        <ActionIcon variant="light">
                            <Icon path={mdiAccount} style={{ width: rem(18), height: rem(18) }}/>
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item leftSection={<Icon path={mdiLockReset} style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => {
                                       modals.open({
                                           title: '修改密码',
                                           centered: true,
                                           children: (
                                               <PasswordChange setChangingPasswd={setChangingPasswd}
                                                               changingPasswd={changingPasswd} pageTypeSet={pageTypeSet}/>
                                           ),
                                       })
                                   }}>
                            修改密码
                        </Menu.Item>
                        <Menu.Item leftSection={<Icon path={mdiRefresh} style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => refreshUserData()}>
                            刷新用户信息
                        </Menu.Item>
                        <Menu.Item leftSection={<Icon path={mdiExitToApp} style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => logout()} color="red">
                            退出登录
                        </Menu.Item>
                        <Menu.Label>用户信息</Menu.Label>
                        <Menu.Item disabled>
                            用户名: <Text span fw={500}>{userData.user_name}</Text>
                        </Menu.Item>
                        <Menu.Item rightSection={<Icon path={mdiPlusBoxOutline} style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => notBindQQBuyConfirm("https://afdian.net/a/chieri?tab=shop")}>
                            剩余点数: <Text span fw={500}>{userData.left_point}</Text>
                        </Menu.Item>
                        <Menu.Item rightSection={<Icon path={mdiPlusBoxOutline} style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => notBindQQBuyConfirm("https://afdian.net/item/cb1d927cc1e211ee8fad52540025c377")}>
                            包月到期: <Text span fw={500}>{getMonthlyTimeStr(userData.monthly_expiration)}</Text>
                        </Menu.Item>
                        <Menu.Item rightSection={<Icon path={userData.bind_qq ? mdiSwapHorizontal : mdiPlusBoxOutline}
                                                       style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => changeBindQQConfirm()}>
                            绑定QQ: <Text span fw={500}>{userData.bind_qq ? userData.bind_qq : "未绑定"}</Text>
                        </Menu.Item>
                        <Menu.Item rightSection={<Icon path={mdiSwapHorizontal}
                                                       style={{ width: rem(14), height: rem(14) }} />}
                                   onClick={() => {
                                       modals.open({
                                        title: '修改邮箱',
                                        centered: true,
                                        children: (
                                            <EmailChange setChangingEmail={setChangingEmail} changingEmail={changingEmail}
                                                         refreshUserData={refreshUserData}/>
                                        ),
                                       })}}>
                            绑定邮箱: <Text span fw={500}>{userData.email}</Text>
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Group>
    )
}
