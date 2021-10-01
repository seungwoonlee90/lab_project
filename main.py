import os
import pandas as pd
import requests

url = 'https://raw.githubusercontent.com/seungwoonlee90/toy_project/master/water_power/obscd.csv'
obs = pd.read_csv(url, encoding='cp949')
obscds = obs['obscd'].to_list()

df = []

api_key = os.environ.get("SECURE")

for obscd in obscds :
    url = f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dtdata?obscd={obscd}&year=2021&output=json&key={api_key}'
    res = requests.get(url)
    data = res.json()
    if data['count'] != 0 :
        df.append([obscd, data['list'][-1]['ymd'], data['list'][-1]['fw']])
    else :
        pass

df = pd.DataFrame(df, columns= ['obscd', 'ymd', 'fw'])
df['fw'] = df['fw'].apply(lambda x : '-999' if (x == '-') else x)
df['fw'] = df['fw'].astype(float)
res = pd.merge(obs, df, on='obscd', how='outer')
res.to_csv('./res.csv', encoding='cp949', index=False)