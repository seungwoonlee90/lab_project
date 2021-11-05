import os
import json
from aiohttp import ClientSession
import asyncio
import time
from datetime import datetime
import pandas as pd

apiKey = os.environ.get("SECURE")
year = datetime.today().year


async def fetcher(session, url):
    async with session.get(url) as response:
        return await response.text()


async def results(result, count):
    res = json.loads(result[count])
    res_count = res['count']
    obscds = [[res['list'][k]['obscd'], res['list'][k]['obsnm'], res['list']
               [k]['sbsncd'], res['list'][k]['mngorg']]for k in range(res_count)]
    return obscds


async def main(apiKey):
    urls = [
        f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/wl_dubwlobs?basin={j}&oper=y&output=json&key={apiKey}' for j in range(1, 6)]

    async with ClientSession() as session:
        result = await asyncio.gather(*[fetcher(session, url) for url in urls])
        datas = await asyncio.gather(*[results(result, count) for count in range(5)])
        df = pd.DataFrame([y for x in datas for y in x], columns=[
                          'obscd', 'obsnm', 'sbsncd', 'mngorg'])
        return df


async def hydro(result):
    try:
        res = json.loads(result)['list'][-1]
        return res
    except:
        pass


async def smallhydro(obscds, apiKey):
    urls = [
        f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dtdata?obscd={obscd}&year={year}&output=json&key={apiKey}' for obscd in obscds]
    async with ClientSession() as session:
        results = await asyncio.gather(*[fetcher(session, url) for url in urls])
        result = await asyncio.gather(*[hydro(result)for result in results])
        return pd.DataFrame(obscds, columns=['obscd']).join(pd.DataFrame([i if i is not None else {
            'ymd': '-999', 'fw': '-999'} for i in result]))


if __name__ == "__main__":
    start = time.time()
    base = asyncio.run(main(apiKey))
    df = asyncio.run(smallhydro(base['obscd'].to_list(), apiKey))
    res = pd.merge(base, df, on='obscd', how='outer')
    res['fw'] = res['fw'].apply(lambda x: '-999' if (x == '-') else x)
    res['fw'] = res['fw'].astype(float)
    print(res)
    print(time.time() - start)

with open('./samllhydro.json', 'a', encoding='utf-8') as file:
    res.to_json(file, force_ascii=False, orient='records')
