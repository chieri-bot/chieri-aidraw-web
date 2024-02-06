import React, {useEffect, useState} from "react";
import {Container, MantineProvider, ScrollArea, useMantineColorScheme} from "@mantine/core";
import LoginPage from "./LoginPage.tsx";
import {PageType} from "../utils/enums.ts";
import RegisterPage from "./RegisterPage.tsx";
import {UserData} from "../utils/models.ts";
import DrawPage from "./DrawPage.tsx";
import {apiGetLeftPoint, apiGetUserInfo} from "../utils/api.ts";
import {showErrorMessage} from "../utils/utils.ts";

export default function MainPage() {
    const [currentStat, setCurrentStat] = useState(PageType.Login);
    const [userData, setUserData] = useState<UserData>({
        bind_qq: "",
        email: "",
        left_point: -1,
        monthly_expiration: 0,
        uid: -1,
        user_name: ""
    });

    const [width, setWidth] = useState(window.innerWidth)
    // const [height, setHeight] = useState(window.innerHeight)


    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            // setHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const refreshUserData = () => {
        const userToken = localStorage.getItem("token")
        if (!userToken) setCurrentStat(PageType.Login)
        apiGetUserInfo()
            .then((result) => {
                if (result.success) {
                    result.data!.left_point = Number(result.data!.left_point)
                    setUserData(result.data! as UserData)
                    if (currentStat == PageType.Login) {
                        setCurrentStat(PageType.Draw)
                    }
                }
                else {
                    if (currentStat != PageType.Login) showErrorMessage(result.msg, "获取用户信息失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "错误"))
    }

    const refreshLeftPoint = () => {
        apiGetLeftPoint()
            .then((result) => {
                if (result.success) {
                    setUserData({
                        bind_qq: userData.bind_qq,
                        email: userData.email,
                        left_point: Number(result.left_point),
                        monthly_expiration: userData.monthly_expiration,
                        uid: userData.uid,
                        user_name: userData.user_name
                    })
                }
                else {
                    showErrorMessage(result.msg, "刷新剩余点数失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "刷新剩余点数出错"))
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            refreshUserData()
        }
    }, []);

    const changePageStat = (pageType: PageType) => {
        setCurrentStat(pageType)
        if (pageType == PageType.Draw) {
            refreshUserData()
        }
    }

    return (
        <MantineProvider>
                <Container maw={width} w={width}>
                    <ScrollArea>
                        {(() => {
                            switch (currentStat) {
                                case PageType.Login:
                                    return <LoginPage pageTypeSet={changePageStat}/>
                                case PageType.Register:
                                    return <RegisterPage pageTypeSet={changePageStat}/>
                                case PageType.Draw:
                                    return <DrawPage pageTypeSet={changePageStat} userData={userData}
                                                     refreshUserData={refreshUserData} refreshLeftPoint={refreshLeftPoint}/>
                                default:
                                    return null
                            }
                        })()}
                    </ScrollArea>
                </Container>
        </MantineProvider>
    );
}