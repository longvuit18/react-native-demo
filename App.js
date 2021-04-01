import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList, Image, Modal, TouchableOpacity, TextInput, Alert, SafeAreaView, Button } from "react-native";
import logo from "./assets/logo.jpg";
import { Icon } from "react-native-elements";
import { ActivityIndicator } from "react-native";
import axios from "axios";

const DATA = [
    {
        id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
        day: "Thứ 2",
        subjects: [
            {
                subject: "Tư tưởng HCM",
                class: "D3 - 101",
                time: "9h 30 - 12h 45",
            },
            {
                subject: "Mạng máy tính",
                class: "TC - 307",
                time: "12h 30 - 3h ",
            },
            {
                subject: "Cầu lông",
                class: "Sân B",
                time: "4h - 5h ",
            },
        ],
    },
    {
        id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
        day: "Thứ 3",
        subjects: [
            {
                subject: "Lập trình hướng đối tượng",
                class: "TC - 205",
                time: "6h 45 - 9h 10",
            },
            {
                subject: "Nhập môn CNPM",
                class: "TC - 205",
                time: "10h 15 - 11h 45",
            },
            {
                subject: "Tư duy công nghệ",
                class: "TC - 211",
                time: "12h 30 - 3h 05",
            },
        ],
    },
    {
        id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f64",
        day: "Thứ 3",
        subjects: [
            {
                subject: "Lập trình hướng đối tượng",
                class: "TC - 205",
                time: "6h 45 - 9h 10",
            },
            {
                subject: "Nhập môn CNPM",
                class: "TC - 205",
                time: "10h 15 - 11h 45",
            },
            {
                subject: "Tư duy công nghệ",
                class: "TC - 211",
                time: "12h 30 - 3h 05",
            },
        ],
    },
];

const Item = ({ day, subjects, addEventToDay, id }) => (
    <View style={styles.item}>
        <View
            style={{
                flex: 1,
                flexDirection: "row",
                height: 30,
            }}
        >
            <View
                style={{
                    flex: 3,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={styles.title}>{day}</Text>
            </View>
            <View style={{ flex: 5, backgroundColor: "#59ADFF" }} />
            <View style={{ flex: 3, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Icon name="info-outline" color={"#59ADFF"} containerStyle={{ marginRight: 15 }} size={30} />
                <Icon name="add-circle-outline" onPress={() => addEventToDay(id)} color={"#59ADFF"} size={30} />
            </View>
        </View>

        <View style={{ flex: 1, padding: 10 }}>
            {subjects.map((item, index) => {
                return (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            marginBottom: 15,
                            marginTop: 5,
                        }}
                    >
                        <View
                            style={{
                                flex: 2,
                                alignItems: "center",
                                borderRightWidth: 2,
                                borderRightColor: "#59ADFF",
                            }}
                        >
                            <Text>{item.class}</Text>
                            <Text>{item.time}</Text>
                        </View>
                        <View
                            style={{
                                flex: 2,
                                alignItems: "center",
                            }}
                        >
                            <Text style={styles.subject}>{item.subject}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    </View>
);

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

Notifications.setNotificationCategoryAsync("notificationButton", [
    {
        identifier: "ok",
        buttonTitle: "Ok",
        options: {
            opensAppToForeground: false,
        },
    },
    {
        identifier: "wait",
        buttonTitle: "Lát nữa",
        options: {
            opensAppToForeground: false,
        },
    },
]);
export default function App() {
    const [openModal, setOpenModal] = useState(false);
    const [init, setInit] = useState(false);
    const [data, setData] = useState(DATA);
    const [uri, port] = Constants.manifest.debuggerHost.split(":");
    React.useEffect(() => {
        // console.log("start ...");
        const fetchData = async () => {
            // const startTime = new Date().getTime();
            const dataResponse = await axios.get(`http://${uri}:3000/data`);
            await testNotification(dataResponse.data);
            // console.log(new Date().getTime() - startTime);
            setInit(true);
        };

        fetchData();
    }, []);
    // effect
    const getNotificationPermissionStatus = async () => {
        const existingStatus = await Notifications.getPermissionsAsync();
        return existingStatus.granted || existingStatus.ios ? existingStatus === 3 : false;
    };
    React.useEffect(() => {
        const requestNotificationPermission = async () => {
            let existingStatus = await getNotificationPermissionStatus();
            if (!existingStatus) {
                return await Notifications.requestPermissionsAsync({
                    android: {},
                    ios: {
                        allowAlert: true,
                        allowSound: true,
                        allowAnnouncements: true,
                    },
                });
            }
        };

        requestNotificationPermission().then(() => {});
    }, []);

    // get Data

    React.useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
            if (response.actionIdentifier === "wait") {
                await Notifications.dismissNotificationAsync(response.notification.request.identifier);
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: response.notification.request.content.title,
                        body: response.notification.request.content.body,
                        sound: true,
                        ios: { sound: true },
                        categoryIdentifier: "notificationButton",
                    },
                    trigger: { seconds: 5 },
                });
            }

            if (response.actionIdentifier === "ok") {
                await Notifications.dismissNotificationAsync(response.notification.request.identifier);
            }
        });
        return () => subscription.remove();
    }, []);

    // render item
    const [idItem, setIdItem] = useState(null);
    const renderItem = ({ item }) => (
        <Item
            day={item.day}
            subjects={item.subjects}
            id={item.id}
            addEventToDay={(id) => {
                setOpenModal(true);
                setIdItem(id);
            }}
        />
    );

    // onChange
    const [eventInformation, setEventInformation] = useState({ event: "", description: "", place: "", time: 0 });
    const onChangeValue = (value, field) => {
        setEventInformation({
            ...eventInformation,
            [field]: value,
        });
    };

    // set notification

    const setNotification = async (id, eventInformation) => {
        const t = data.map((item) => {
            if (item.id !== id) {
                return item;
            }

            return {
                ...item,
                subjects: [
                    ...item.subjects,
                    {
                        subject: eventInformation.event,
                        class: eventInformation.place,
                        time: `sau ${eventInformation.time} giây nữa`,
                    },
                ],
            };
        });

        setData(t);
        await schedulePushNotification(eventInformation);
        Alert.alert("", "Thêm sự kiện thành công!", [
            {
                text: "Ok",
                onPress: () => {
                    setOpenModal(false);
                    setEventInformation({ event: "", description: "", place: "", time: 0 });
                },
            },
        ]);
    };

    if (init === false) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#59ADFF",
                    padding: 5,
                }}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, marginBottom: 30 }}>
                    <Image source={logo} />
                </View>
                <View style={{ flex: 8 }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </View>
        );
    }
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#59ADFF",
                padding: 5,
            }}
        >
            <Modal transparent={true} visible={openModal}>
                <View style={styles.modalView}>
                    <View style={styles.contentModal}>
                        <View style={{ flexDirection: "row", flex: 2, alignItems: "center" }}>
                            <View style={{ flex: 3 }}>
                                <Text style={{ fontSize: 15 }}>Sự kiện: </Text>
                            </View>
                            <View style={{ flex: 7 }}>
                                <TextInput style={{ borderWidth: 1, borderRadius: 4, height: 30 }} onChangeText={(text) => onChangeValue(text, "event")} />
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", flex: 3, alignItems: "center" }}>
                            <View style={{ flex: 3 }}>
                                <Text style={{ fontSize: 15 }}>Mô tả: </Text>
                            </View>
                            <View style={{ flex: 7 }}>
                                <TextInput style={{ borderWidth: 1, borderRadius: 4, height: 30 }} multiline numberOfLines={3} onChangeText={(text) => onChangeValue(text, "description")} />
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", flex: 2, alignItems: "center" }}>
                            <View style={{ flex: 3 }}>
                                <Text style={{ fontSize: 15 }}>Địa điểm: </Text>
                            </View>
                            <View style={{ flex: 7 }}>
                                <TextInput style={{ borderWidth: 1, borderRadius: 4, height: 30 }} onChangeText={(text) => onChangeValue(text, "place")} />
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", flex: 2, alignItems: "center" }}>
                            <View style={{ flex: 3 }}>
                                <Text style={{ fontSize: 15 }}>Hẹn giờ: </Text>
                            </View>
                            <View style={{ flex: 7 }}>
                                <TextInput style={{ borderWidth: 1, borderRadius: 4, height: 30 }} keyboardType="numeric" onChangeText={(text) => onChangeValue(Number(text), "time")} />
                            </View>
                        </View>
                        <View style={{ flex: 2 }} />
                        <View style={styles.closeItem}>
                            <TouchableOpacity
                                onPress={() => {
                                    setNotification(idItem, eventInformation);
                                }}
                            >
                                <Text style={{ color: "#59ADFF", fontWeight: "bold", fontSize: 18, marginRight: 20 }}>OK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setOpenModal(false)}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, marginBottom: 30 }}>
                <Image source={logo} />
            </View>
            <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => item.id} />
            {/* <Button
                onPress={async () => {
                    await test10Notification();
                }}
                title="Test 10 notification"
            /> */}
        </SafeAreaView>
    );
}

async function testNotification(datas) {
    datas.forEach(async (item, index) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Demo ${index}`,
                body: `Đây là Demo thứ ${index}`,
                sound: true,
                ios: { sound: true },
                categoryIdentifier: "notificationButton",
            },
            trigger: { date: new Date("01/20/2021") },
        });
    });
}

async function test10Notification() {
    const test = [];
    for (let i = 0; i < 30; i++) {
        test.push(i);
    }
    test.forEach(async (item, index) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Demo ${index}`,
                body: `Đây là Demo thứ ${index}`,
                sound: true,
                ios: { sound: true },
                categoryIdentifier: "notificationButton",
            },
            trigger: { seconds: 15 },
        });
    });
}

async function schedulePushNotification(event) {
    const t = new Date().getTime();
    const a = await Notifications.scheduleNotificationAsync({
        content: {
            title: event.event,
            body: event.description,
            sound: true,
            ios: { sound: true },
            categoryIdentifier: "notificationButton",
        },
        trigger: { seconds: event.time },
    });
    console.log(new Date().getTime() - t);
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: "#fff",

        margin: 20,
        borderRadius: 4,
    },
    title: {
        fontSize: 15,
    },

    subject: {
        textAlign: "center",
    },

    modalView: {
        backgroundColor: "rgba(0,0,0,0.5)",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
    },
    contentModal: {
        margin: 20,
        width: 300,
        height: 270,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        paddingTop: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    closeItem: {
        position: "absolute",
        bottom: 15,
        right: 20,
        flexDirection: "row",
    },
});
