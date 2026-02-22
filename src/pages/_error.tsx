import Error from "next/error";

export default function CustomError({ statusCode }: { statusCode: number }) {
    return <Error statusCode={statusCode} />;
}

CustomError.getInitialProps = async ({ res, err }: any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};
