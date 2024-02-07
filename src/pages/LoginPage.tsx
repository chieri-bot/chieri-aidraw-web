import React, { useState } from "react";
import {TextInput, Button, Group, Box, Text, PasswordInput} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {apiLogin} from "../utils/api.ts";
import {showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import {confirmCheck} from "../components/subs/confirms.tsx";
import copy from "clipboard-copy";
import {marginTopBottom} from "../styles.ts";
import {recaptcha} from "./MainPage.tsx";


export default function LoginPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const form = useForm({
        initialValues: {
            userName: '',
            password: '',
        }
    });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const onClickRegister = () => {
        pageTypeSet(PageType.Register)
    }

    const onClickLogin = (values: {userName: string, password: string}) => {
        setIsLoggingIn(true)

        recaptcha.getToken("login")
            .then((token) => {
                apiLogin(values.userName, values.password, token)
                    .then((result) => {
                        if (result.success) {
                            localStorage.setItem("token", result.token!)
                            showInfoMessage("", "登录成功", 3000)
                            pageTypeSet(PageType.Draw)
                        }
                        else {
                            showErrorMessage(result.msg, "登录失败")
                        }
                    })
                    .catch((e) => showErrorMessage(e.toString(), "错误"))
                    .finally(() => setIsLoggingIn(false))
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                setIsLoggingIn(false)
            })
    }

    const forgetPasswordConfirm = () => {
        confirmCheck("忘记密码", "若您的账户绑定了QQ，请使用对应的账号向任意分布式 Chieri Bot 发送: /aiaccount reset password", () => {
            copy("/aiaccount reset password")
                .then(() => showInfoMessage("", "复制成功", 3000))
                .catch((reason) => showErrorMessage(reason.toString(), "复制指令失败"))

        }, "之后您的密码将会被重置为您的用户名。若未绑定，请使用注册账户时填写的邮箱，向 chinosk@qq.com 发送找回请求。管理员将会手动处理，并在处理完后回复（你也可以直接联系Bot管理员）。",
            {confirm: "复制指令", cancel: "关闭"})
    }

    return (
            <Box maw={340} mx="auto" style={marginTopBottom}>
                <Text fw={700} size="xl">登录</Text>
                <form onSubmit={form.onSubmit((values) => onClickLogin(values))}>
                    <TextInput
                        withAsterisk
                        label="用户名"
                        placeholder="输入用户名、邮箱或者绑定QQ号"
                        {...form.getInputProps('userName')}
                    />
                    <PasswordInput
                        withAsterisk
                        label="密码"
                        placeholder="密码"
                        {...form.getInputProps('password')}
                    />

                    <Group mt="md" justify="space-between">
                        <Button onClick={() => forgetPasswordConfirm()}>忘记密码?</Button>
                        <Group justify="flex-end">
                            <Button onClick={onClickRegister}>注册</Button>
                            <Button type="submit" disabled={isLoggingIn}>登录</Button>
                        </Group>
                    </Group>
                </form>
            </Box>
    );
}
