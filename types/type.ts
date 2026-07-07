
/* CRUD Board */

import { Dispatch, SetStateAction } from "react";

export interface InquireBoardFormProps {
    name: string;
    category: string;
    mail_id: string;
    mail_address: string;
    title: string;
    contents: string;
    password_hash: string;
    file_url: File | null;
    privacy: boolean;
}

export interface InquireBoardListProps {
    name: string;
    category: string;
    mail_id: string;
    mail_address: string;
    title: string;
    contents: string;
    file_url: File | null;
    created_at: string;
}

export interface NoticeFormProps {
    title: string;
    contents: string;
    file_url: null | File
}

export interface NoticeListProps {
    title: string;
    contents: string;
    file_url: null | File;
    created_at: string;
}

export interface QuickFormProps {
    name: string,
    phoneFront: string;
    phoneMiddle: string;
    phoneLast: string;
    privacy: boolean
}

// 여러 게시판(공지사항/문의 등)에서 공용으로 사용하는 QuillEditor 컴포넌트의 props
export interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/* Login */

export interface NomalLoginFormProps {
    admin_id : string;
    password_hash : string;
}

/* Toast */

export interface ToastProps {
    vaild: string | null;
    setVaild: Dispatch<SetStateAction<string | null>>;
    onConfirm?: () => void;
}