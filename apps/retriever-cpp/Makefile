CXX = g++
CXXFLAGS = -std=c++17 -O2 -Wall
TARGET = retriever

ifeq ($(OS),Windows_NT)
	LDFLAGS = -lws2_32
	TARGET_EXT = .exe
else
	LDFLAGS =
	TARGET_EXT =
endif

all: $(TARGET)$(TARGET_EXT)

$(TARGET)$(TARGET_EXT): main.cpp retriever.h
	$(CXX) $(CXXFLAGS) -o $@ main.cpp $(LDFLAGS)

clean:
	rm -f $(TARGET) $(TARGET).exe

.PHONY: all clean
