import {modals} from "@mantine/modals";
import {Text} from "@mantine/core";
import React from "react";

export const confirmDelete = (title: string, innerText: string, onConfirm: () => any) => {
    modals.openConfirmModal({
        title: title,
        centered: true,
        children: (
            <Text size="sm">
                {innerText}
            </Text>
        ),
        labels: { confirm: '删除', cancel: "取消" },
        confirmProps: { color: 'red' },
        onConfirm: () => onConfirm()
    })
}

export const confirmCheck = (title: string, innerText: string, onConfirm: () => any, secondLineText?: string,
                             labels?: { confirm: string, cancel: string }) => {
    modals.openConfirmModal({
        title: title,
        centered: true,
        children: (
            <>
                <Text size="sm">
                    {innerText}
                </Text>
                {secondLineText && <Text size="sm">
                    {secondLineText}
                </Text>}
            </>
        ),
        labels: labels ? labels : { confirm: '确定', cancel: "取消" },
        onConfirm: () => onConfirm()
    })
}
