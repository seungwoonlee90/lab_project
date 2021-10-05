import os
import pandas as pd
from bs4 import BeautifulSoup
import requests

apiKey = os.environ.get("SECURE")
st = ['S01001', 'S01002']

df = []

for s in st :
    url = f'http://apis.data.go.kr/1480523/WaterQualityService/getRealTimeWaterQualityList?numOfRows=1&siteId={s}&serviceKey={apiKey}&resultType=xml'
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'html.parser')
    df.append([soup.find_all('siteid')[0].get_text(),
               soup.find_all('sitename')[0].get_text(),
               soup.find_all('msrdate')[0].get_text(),
               soup.find_all('m02')[0].get_text(),
               soup.find_all('m38')[0].get_text(),
               soup.find_all('m69')[0].get_text(),
              ])

df = pd.DataFrame(df, columns = ['siteid', 'sitename', 'msrdate', 'm02', 'm38', 'm69']).fillna(0)
df['temp'] = df.iloc[:, -3:].sum(axis=1)
df = df[['siteid', 'sitename', 'msrdate','temp']]
df['temp'] = df['temp'].replace('', '-999').astype(float)
flag_df = df[df['temp'] > -999]

quartile_1 = flag_df['temp'].quantile(0.25)
quartile_3 = flag_df['temp'].quantile(0.75)
IQR = quartile_3 - quartile_1
min_iqr = quartile_1 - 1.5 * IQR
max_iqr = quartile_3 + 1.5 * IQR

df['flag'] = df['temp'].apply(lambda x : 1 if (x < min_iqr) | (x > max_iqr) else 0)

with open('./hydrothermal.json', 'w', encoding='utf-8') as file:
    df.to_json(file, force_ascii=False, orient='records')