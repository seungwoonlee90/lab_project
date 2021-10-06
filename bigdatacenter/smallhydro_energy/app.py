import os
import pandas as pd
import requests

apiKey = os.environ.get("SECURE")
obs = pd.read_csv('obscd.csv', encoding='cp949')
obscds = obs['obscd'].to_list()

df = []

for obscd in obscds :
    url = f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dtdata?obscd={obscd}&year=2021&output=json&key={apiKey}'
    res = requests.get(url)
    data = res.json()
    if data['count'] != 0 :
        df.append([obscd, data['list'][-1]['ymd'], data['list'][-1]['fw']])
    else :
        pass
    
print('수집 완료')

df = pd.DataFrame(df, columns= ['obscd', 'ymd', 'fw'])
df['fw'] = df['fw'].apply(lambda x : '-999' if (x == '-') else x)
df['fw'] = df['fw'].astype(float)
res = pd.merge(obs, df, on='obscd', how='outer')

with open('./samllhydro.json', 'a', encoding='utf-8') as file:
    res.to_json(file, force_ascii=False, orient='records')