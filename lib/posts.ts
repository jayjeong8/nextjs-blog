import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {remark} from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts'); //current working directory에 /posts를 합친다.

export const getSortedPostsData = () => {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory); //postsDirectory 목록을 동기로 가져온다.
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName); //각 파일마다의 경로
        const fileContents = fs.readFileSync(fullPath, 'utf8'); //각 파일의 내용(contents), 인코딩 옵션이 지정되면 문자열을 반환하고, 아니면 버퍼를 반환한다.

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents); //md파일 상단 -- 기입 내용을 metadata로 변환

        // Combine the data with the id
        return {
            id,
            ...(matterResult.data as { date: string; title: string }),
        };
    });
    //Sort posts by date
    return allPostsData.sort(({date: a}, {date: b}) => {
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
}

export const getAllPostIds = () => {
    const fileNames = fs.readdirSync(postsDirectory);

    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, '')
            }
        }
    })
}

export const getPostData = async (id: string) => {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Combine the data with the id
    return {
        id,
        contentHtml,
        ...(matterResult.data as { date: string; title: string }),
    }
}