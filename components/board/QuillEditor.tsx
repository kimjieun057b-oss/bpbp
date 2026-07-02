"use client"
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import { QuillEditorProps } from '@/types/type';

// npm i react-quill-new (React 16+, Typescript 지원)
// https://github.com/VaguelySerious/react-quill
// https://adjh54.tistory.com/735 : 예시
// quill-delta : Delta 자료구조 전용 라이브러리
// @mgreminger/quill-image-resize-module : 이미지 사이즈 조절
// quill-delta-to-html : Delta > html로 변환
// quill-better-table : table 표

// 500 error : react-quill이 내부적으로 브라우저 객체(document, window)를 곧바로 참조하여 Node.js 환경(서버)에서 터짐 --> mext/dynamic 활용
// QuillEditor 컴포넌트를 서버사이드렌더링(SSR)에서 제외하고 브라우저(client)에서만 불러오도록 함

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="w-full h-98.5 bg-surface rounded-lg animate-pulse" />
})

// 여러 CRUD 게시판(공지사항/문의 등)에서 공용으로 사용하기 위해
// value/onChange를 부모로부터 전달받는 controlled 컴포넌트로 구현
export default function QuillEditor({ value, onChange, placeholder = "내용을 입력해주세요." }: QuillEditorProps) {

    // Quill 에디터의 툴바 옵션 (이미지 레이아웃에 맞춰 간소화 또는 확장 가능)
    // dynamic 컴포넌트 사용 시, modules 객체를 useMemo로 감싸줘야
    // 타이핑할 때마다 에러나거나 툴바가 튕기는 현상을 막음
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ],
    }), []);

    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            placeholder={placeholder}
        />

    );
}