# yt-dlp 下载B站视频

1. 下载 yt-dlp.exe：https://github.com/yt-dlp/yt-dlp/releases
2. 下载 ffmpeg：https://www.gyan.dev/ffmpeg/builds/

![](../../assets/ffmpeg_download.png ":size=800")

3. 解压 ffmpeg 到任意位置，将 bin 目录 放到系统环境变量的 PATH 中，类似于：`D:\ffmpeg-8.0.1-essentials_build\bin` 这样一条信息添加到环境变量
4. 下载 B站视频，命令为：
   ```bash
   .\yt-dlp.exe -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "%(title)s.%(ext)s" https://www.bilibili.com/video/BV1AoUVBaEiv/
   ```
   解释：最高音画质，合并视频和音频，输出格式为 mp4

- 下载油管（youtube）命令类似，如果代理节点不干净，可以加一个 cookie 参数（直接问 AI 命令）
- 获取 cookie 可以使用插件：[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)（Chrome 插件）
- 打开油管，再点击插件图标，点击 `Export` 即可导出 cookie 文件，可以重命名为 `cookies.txt`
