FROM ubuntu
RUN echo "Pacific/Auckland" > /etc/timezone
RUN apt update
RUN apt upgrade -y
RUN DEBIAN_FRONTEND=noninteractive apt install -yq nodejs npm tar bzip2 wget fuse wine-stable unzip zip mono-devel curl libfuse2 binutils bash-completion fakeroot html2text libmd0 build-essential rpm2cpio cpio jq
RUN dpkg --add-architecture i386 && apt update && apt install -y wine32