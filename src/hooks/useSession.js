import useSWR from "swr";

import config from "../config";
const { API_HOSTNAME } = config;

const DEFAULT_RETRY_COUNT = 1;

export default (options) => {

    const { errorRetryCount, ...params } = { ...options }; // necessary since options can be undefined
    const getSession = async (key) => {
        try {
            const res = await fetch(key, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) throw { status: res.status };
            else return (await res.json()).data;

        } catch (e) {
            throw { status: e.status || 500 };
        }
    };

    const { data, error, isValidating, mutate } = useSWR(`${API_HOSTNAME}/auth/me`, getSession, {
        revalidateOnFocus: false,
        initialData: null,
        errorRetryCount: errorRetryCount || DEFAULT_RETRY_COUNT,
        ...params,
    });

    console.log("WHY U NO RUN");

    return {
        data,
        error,
        isValidating,
        reset: () => mutate(null, false),
        revalidate: () => mutate(),
        isLoggedIn: !!data || false,
    };

};
