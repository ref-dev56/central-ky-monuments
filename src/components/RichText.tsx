import Link from "next/link";
import {
  StaticTinaMarkdown,
  type Components,
  type TinaMarkdownContent,
} from "tinacms/dist/rich-text/static";

const body = "text-base leading-[1.7] text-body";
const link = "text-link underline hover:text-ink";

/** Renders rich text from Tina with the site's typography. */
export default function RichText({ content }: { content?: unknown }) {
  if (!content) return null;
  return (
    <StaticTinaMarkdown
      content={content as TinaMarkdownContent}
      components={components}
    />
  );
}

const components: Components<object> = {
  p: (props) => <p className={body}>{props?.children}</p>,
  ul: (props) => (
    <ul className={`flex list-disc flex-col gap-1.5 pl-5 ${body}`}>
      {props?.children}
    </ul>
  ),
  ol: (props) => (
    <ol className={`flex list-decimal flex-col gap-1.5 pl-5 ${body}`}>
      {props?.children}
    </ol>
  ),
  h3: (props) => (
    <h3 className="mt-2 text-lg font-semibold">{props?.children}</h3>
  ),
  a: (props) => {
    const url = props?.url ?? "";
    return url.startsWith("/") ? (
      <Link href={url} className={link}>
        {props?.children}
      </Link>
    ) : (
      <a href={url} className={link}>
        {props?.children}
      </a>
    );
  },
};
